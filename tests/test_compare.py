from __future__ import annotations

import unittest
from copy import deepcopy

from model_drift.compare import compare_manifests
from model_drift.models import AnalysisStatus, ChangeKind, FunctionalClassification
from model_drift.serialization import canonical_json_text


def _manifest() -> dict[str, object]:
    return {
        "schemaVersion": "0.1.0",
        "generator": {
            "name": "tests",
            "version": "0.1.0",
            "strategy": "fixture",
        },
        "source": {
            "artifact": "models/controller.slx",
            "artifactSha256": "fixture",
        },
        "analysis": {
            "status": "complete",
            "warnings": [],
            "unsupportedFeatures": [],
        },
        "model": {
            "name": "controller",
            "modelType": "model",
            "rootPath": "controller",
        },
        "interfaces": {
            "inports": [
                {
                    "id": "interface:inport:Speed",
                    "name": "Speed",
                    "direction": "input",
                    "port": 1,
                    "dataType": "double",
                    "dimensions": [1],
                    "sampleTime": "inherited",
                    "unit": "m/s",
                    "minimum": None,
                    "maximum": None,
                }
            ],
            "outports": [],
            "triggerPorts": [],
            "enablePorts": [],
            "buses": [],
        },
        "systems": [],
        "blocks": [
            {
                "id": "block:controller/Gain",
                "path": "controller/Gain",
                "name": "Gain",
                "blockType": "Gain",
                "parent": "controller",
                "ports": {"inputs": 1, "outputs": 1},
                "parameters": {
                    "Gain": {"value": "2.5", "valueType": "expression"},
                    "Position": {"value": [0, 0, 10, 10], "valueType": "array"},
                },
            },
            {
                "id": "block:controller/Out",
                "path": "controller/Out",
                "name": "Out",
                "blockType": "Outport",
                "parent": "controller",
                "ports": {"inputs": 1, "outputs": 0},
                "parameters": {},
            },
        ],
        "connections": [
            {
                "id": "connection:gain-out",
                "source": {"blockId": "block:controller/Gain", "port": 1},
                "destination": {"blockId": "block:controller/Out", "port": 1},
                "signal": {
                    "name": "Command",
                    "dataType": "double",
                    "dimensions": [1],
                    "unit": None,
                },
            }
        ],
        "stateflow": {},
        "configuration": {"Solver": {"Type": "Fixed-step"}},
        "references": {},
    }


class ComparisonTests(unittest.TestCase):
    def test_detects_semantic_changes_and_is_deterministic(self) -> None:
        base = _manifest()
        target = deepcopy(base)
        target["source"]["artifact"] = "models/controller-target.slx"  # type: ignore[index]
        target["blocks"][0]["parameters"]["Gain"]["value"] = "3.0"  # type: ignore[index]
        target["blocks"][0]["parameters"]["Position"]["value"] = [  # type: ignore[index]
            1,
            2,
            11,
            12,
        ]
        target["interfaces"]["inports"][0]["dataType"] = "single"  # type: ignore[index]
        target["configuration"]["Solver"]["Type"] = "Variable-step"  # type: ignore[index]
        target["blocks"].append(  # type: ignore[union-attr]
            {
                "id": "block:controller/Saturation",
                "path": "controller/Saturation",
                "name": "Saturation",
                "blockType": "Saturation",
                "parent": "controller",
                "ports": {"inputs": 1, "outputs": 1},
                "parameters": {},
            }
        )

        first = compare_manifests(base, target)
        second = compare_manifests(
            {**base, "blocks": list(reversed(base["blocks"]))},  # type: ignore[arg-type]
            {**target, "blocks": list(reversed(target["blocks"]))},  # type: ignore[arg-type]
        )

        self.assertEqual(
            canonical_json_text(first),
            canonical_json_text(second),
        )
        by_property = {change.property: change for change in first.changes}
        self.assertEqual(by_property["parameters.Gain.value"].before, "2.5")
        self.assertEqual(by_property["parameters.Gain.value"].after, "3.0")
        self.assertEqual(
            by_property["parameters.Position.value"].functional_classification,
            FunctionalClassification.NON_FUNCTIONAL,
        )
        self.assertEqual(by_property["dataType"].category, "interface")
        self.assertEqual(by_property["Solver.Type"].category, "configuration")
        self.assertEqual(first.summary.added, 1)
        self.assertEqual(first.summary.interface_changes, 1)

    def test_unique_named_signal_reconnection_is_not_remove_and_add(self) -> None:
        base = _manifest()
        target = deepcopy(base)
        target_connection = target["connections"][0]  # type: ignore[index]
        target_connection["id"] = "connection:gain-other"
        target_connection["destination"] = {
            "blockId": "block:controller/Other",
            "port": 1,
        }

        drift = compare_manifests(base, target)

        connection_changes = [
            change for change in drift.changes if change.category == "connection"
        ]
        self.assertEqual(len(connection_changes), 1)
        self.assertEqual(connection_changes[0].kind, ChangeKind.RECONNECTED)
        self.assertEqual(connection_changes[0].match.strategy, "source-and-signal")
        self.assertEqual(connection_changes[0].match.confidence, 0.95)

    def test_ambiguous_reconnection_stays_added_and_removed(self) -> None:
        base = _manifest()
        duplicate = deepcopy(base["connections"][0])  # type: ignore[index]
        duplicate["id"] = "connection:gain-second"
        duplicate["destination"] = {
            "blockId": "block:controller/Second",
            "port": 1,
        }
        base["connections"].append(duplicate)  # type: ignore[union-attr]
        target = deepcopy(base)
        target["connections"] = [
            {
                **deepcopy(base["connections"][0]),  # type: ignore[index]
                "id": "connection:gain-new",
                "destination": {
                    "blockId": "block:controller/New",
                    "port": 1,
                },
            }
        ]

        drift = compare_manifests(base, target)

        kinds = [
            change.kind
            for change in drift.changes
            if change.category == "connection"
        ]
        self.assertNotIn(ChangeKind.RECONNECTED, kinds)
        self.assertEqual(kinds.count(ChangeKind.REMOVED), 2)
        self.assertEqual(kinds.count(ChangeKind.ADDED), 1)

    def test_incomplete_input_propagates_status_and_explicit_change(self) -> None:
        base = _manifest()
        target = deepcopy(base)
        target["analysis"] = {
            "status": "partial",
            "warnings": ["Referenced model was unavailable."],
            "unsupportedFeatures": ["referenced-model"],
        }

        drift = compare_manifests(base, target)

        self.assertEqual(drift.comparison.status, AnalysisStatus.PARTIAL)
        analysis_changes = [
            change for change in drift.changes if change.category == "analysis"
        ]
        self.assertEqual(len(analysis_changes), 1)
        self.assertEqual(analysis_changes[0].kind, ChangeKind.UNRESOLVED)
        self.assertEqual(
            analysis_changes[0].evidence.details["comparisonStatus"],
            "partial",
        )

    def test_change_ids_do_not_depend_on_values_or_collection_order(self) -> None:
        base = _manifest()
        first_target = deepcopy(base)
        first_target["blocks"][0]["parameters"]["Gain"]["value"] = "3"  # type: ignore[index]
        second_target = deepcopy(base)
        second_target["blocks"][0]["parameters"]["Gain"]["value"] = "4"  # type: ignore[index]

        first = compare_manifests(base, first_target)
        second = compare_manifests(base, second_target)

        first_change = next(
            change
            for change in first.changes
            if change.property == "parameters.Gain.value"
        )
        second_change = next(
            change
            for change in second.changes
            if change.property == "parameters.Gain.value"
        )
        self.assertEqual(first_change.change_id, second_change.change_id)


if __name__ == "__main__":
    unittest.main()
