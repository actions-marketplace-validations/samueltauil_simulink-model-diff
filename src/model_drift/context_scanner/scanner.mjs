// scanner.mjs
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";

// node_modules/data-explorer-core/dist/datamodel/node/NodeRegistry.js
var classMap = null;
function init(map) {
  classMap = map;
}
function parseValue(rawVal, name, parent) {
  return classMap.parseValue(rawVal, name, parent);
}
function getClass(className) {
  return classMap.getClass(className);
}
function getRegisteredClasses() {
  return classMap.getRegisteredClasses();
}
function wrapDerivedVariable(node) {
  return classMap.wrapDerivedVariable(node);
}
var NodeRegistry_default = { init, parseValue, getClass, getRegisteredClasses, wrapDerivedVariable };

// node_modules/data-explorer-core/dist/datamodel/schema/props/core.json
var core_default = {
  value: { label: "Value", sourcePath: "Value", type: "any", editor: "text" },
  dataType: { label: "Data Type", sourcePath: "DataType", type: "string", editor: "label", default: "" },
  description: { label: "Description", sourcePath: "Description", type: "string", editor: "textArea", default: "" },
  sourceName: { label: "Source Name", sourcePath: "SourceName", type: "string", editor: "label", default: "" }
};

// node_modules/data-explorer-core/dist/datamodel/schema/props/dataObject.json
var dataObject_default = {
  dimensions: { label: "Dimensions", sourcePath: "Dimensions", type: "dims", editor: "label", projected: true },
  complexity: { label: "Complexity", sourcePath: "Complexity", type: "string", editor: "label", default: "real", projected: true },
  dimensionsMode: { label: "Dimensions Mode", sourcePath: "DimensionsMode", type: "string", editor: "label", default: "auto", projected: true },
  min: { label: "Min", sourcePath: "Min", type: "any", editor: "text" },
  max: { label: "Max", sourcePath: "Max", type: "any", editor: "text" },
  unit: { label: "Unit", sourcePath: "DocUnits", type: "string", editor: "text", default: "" },
  storedIntMin: { label: "Stored Integer Min", sourcePath: "StoredIntegerMinimum", type: "any", editor: "label", default: "" },
  storedIntMax: { label: "Stored Integer Max", sourcePath: "StoredIntegerMaximum", type: "any", editor: "label", default: "" },
  initialValue: { label: "Initial Value", sourcePath: "InitialValue", type: "any", editor: "label", default: "" },
  sampleTime: { label: "Sample Time", sourcePath: "SampleTime", type: "any", editor: "label", default: "" },
  samplingMode: { label: "Sampling Mode", sourcePath: "SamplingMode", type: "string", editor: "label", default: "" },
  breakpointsSpecification: { label: "Breakpoints Specification", sourcePath: "BreakpointsSpecification", type: "string", editor: "label", default: "Explicit values" },
  supportTunableSize: { label: "Support Tunable Size", sourcePath: "SupportTunableSize", type: "bool", editor: "label", default: "" },
  allowDifferentTableBpSizes: { label: "Allow Multiple Instances Of Type To Have Different Table Breakpoint Sizes", sourcePath: "AllowMultipleInstancesOfTypeToHaveDifferentTableBreakpointSizes", type: "bool", editor: "label", default: "" },
  bank: { label: "Bank", sourcePath: "Bank", type: "any", editor: "label", default: "" }
};

// node_modules/data-explorer-core/dist/datamodel/schema/props/codeGen.json
var codeGen_default = {
  storageClass: { label: "Storage Class", sourcePath: "CoderInfo.StorageClass", type: "string", editor: "select", default: "Auto", projected: true, options: ["Auto", "SimulinkGlobal", "ExportedGlobal", "ImportedExtern", "ImportedExternPointer", "Custom"] },
  identifier: { label: "Identifier", sourcePath: "CoderInfo.Identifier", type: "string", editor: "label", default: "" },
  dataScope: { label: "Data Scope", sourcePath: "DataScope", type: "string", editor: "label", default: "" },
  headerFile: { label: "Header File", sourcePath: "HeaderFile", type: "string", editor: "label", default: "" },
  alignment: { label: "Alignment", sourcePath: "Alignment", type: "int", editor: "label", default: -1 },
  definitionFile: { label: "Definition File", sourcePath: "CoderInfo.CustomAttributes.DefinitionFile", type: "string", editor: "label", default: "" },
  owner: { label: "Owner", sourcePath: "CoderInfo.CustomAttributes.Owner", type: "string", editor: "label", default: "" },
  preserveDimensions: { label: "Preserve Array Dimensions", sourcePath: "CoderInfo.CustomAttributes.PreserveDimensions", type: "bool", editor: "label", default: "" },
  structName: { label: "Struct Name", sourcePath: "CoderInfo.CustomAttributes.StructName", type: "string", editor: "label", default: "" },
  getFunction: { label: "Get Function", sourcePath: "CoderInfo.CustomAttributes.GetFunction", type: "string", editor: "label", default: "" },
  setFunction: { label: "Set Function", sourcePath: "CoderInfo.CustomAttributes.SetFunction", type: "string", editor: "label", default: "" },
  preserveElementDimensions: { label: "Preserve Element Dimensions", sourcePath: "PreserveElementDimensions", type: "bool", editor: "label", default: "" },
  addClassNameToEnumNames: { label: "Add Class Name To Enum Names", sourcePath: "AddClassNameToEnumNames", type: "bool", editor: "label", default: "" },
  isTunableInCode: { label: "Is Tunable In Code", sourcePath: "IsTunableInCode", type: "bool", editor: "label", default: "" },
  structTypeName: { label: "Name", sourcePath: "StructTypeInfo.Name", type: "string", editor: "label", default: "" },
  structTypeDataScope: { label: "Data Scope", sourcePath: "StructTypeInfo.DataScope", type: "string", editor: "label", default: "Auto" },
  structTypeHeaderFile: { label: "Header File", sourcePath: "StructTypeInfo.HeaderFileName", type: "string", editor: "label", default: "" }
};

// node_modules/data-explorer-core/dist/datamodel/schema/props/typeObject.json
var typeObject_default = {
  storageType: { label: "Storage Type", sourcePath: "StorageType", type: "string", editor: "label", default: "" },
  dataTypeMode: { label: "Data Type Mode", sourcePath: "DataTypeMode", type: "string", editor: "label", default: "" },
  signedness: { label: "Signedness", sourcePath: "Signed", type: "string", editor: "label", default: "" },
  wordLength: { label: "Word Length", sourcePath: "WordLength", type: "any", editor: "label", default: "" },
  fractionLength: { label: "Fraction Length", sourcePath: "FractionLength", type: "any", editor: "label", default: "" },
  slope: { label: "Slope", sourcePath: "Slope", type: "any", editor: "label", default: "" },
  bias: { label: "Bias", sourcePath: "Bias", type: "any", editor: "label", default: "" },
  dataTypeOverride: { label: "Data Type Override", sourcePath: "DataTypeOverride", type: "string", editor: "label", default: "" },
  isAlias: { label: "Is Alias", sourcePath: "IsAlias", type: "bool", editor: "label", default: "" }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/parameter.json
var parameter_default = {
  "Simulink.Parameter": {
    props: [
      "value",
      "dataType",
      "description",
      "dimensions",
      "complexity",
      "min",
      "max",
      "unit",
      "storedIntMin",
      "storedIntMax",
      "storageClass",
      { $ref: "headerFile", sourcePath: "CoderInfo.CustomAttributes.HeaderFile", projected: true },
      { $ref: "alignment", sourcePath: "CoderInfo.Alignment", projected: true },
      "identifier",
      "definitionFile",
      "owner",
      "preserveDimensions",
      "structName",
      "getFunction",
      "setFunction"
    ],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class"] },
      { group: "Value Properties", items: ["dimensions", "complexity", "min", "max", "storedIntMin", "storedIntMax", "unit", "description"] },
      { group: "Code Generation", items: ["storageClass", "identifier", "alignment"] },
      { group: "Custom Attributes", items: ["headerFile", "definitionFile", "owner", "preserveDimensions", "structName", "getFunction", "setFunction"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/signal.json
var signal_default = {
  "Simulink.Signal": {
    props: [
      { $ref: "dataType", default: "auto" },
      "description",
      { $ref: "dimensions", default: -1 },
      "dimensionsMode",
      "initialValue",
      { $ref: "complexity", default: "auto" },
      "min",
      "max",
      "unit",
      "storedIntMin",
      "storedIntMax",
      { $ref: "sampleTime", default: -1 },
      { $ref: "samplingMode", default: "auto" },
      "storageClass",
      "identifier",
      { $ref: "alignment", sourcePath: "CoderInfo.Alignment", projected: true },
      { $ref: "dataScope", sourcePath: "CoderInfo.CustomAttributes.DataScope" },
      { $ref: "headerFile", sourcePath: "CoderInfo.CustomAttributes.HeaderFile", projected: true },
      "definitionFile",
      "owner",
      "preserveDimensions",
      "structName",
      "getFunction",
      "setFunction"
    ],
    layout: [
      { group: "General", items: ["name", "dataType", "kind", "class"] },
      { group: "Value Properties", items: ["dimensions", "dimensionsMode", "initialValue", "complexity", "min", "max", "storedIntMin", "storedIntMax", "unit", "sampleTime", "samplingMode", "description"] },
      { group: "Code Generation", items: ["storageClass", "identifier", "alignment"] },
      { group: "Custom Attributes", items: ["dataScope", "headerFile", "definitionFile", "owner", "preserveDimensions", "structName", "getFunction", "setFunction"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/valueType.json
var valueType_default = {
  "Simulink.ValueType": {
    props: [
      "dataType",
      "description",
      "dimensions",
      { $ref: "dimensionsMode", default: "Fixed" },
      "complexity",
      "min",
      "max",
      { $ref: "unit", sourcePath: "Unit" }
    ],
    layout: [
      { group: "General", items: ["name", "dataType", "kind", "class"] },
      { group: "Value Properties", items: ["dimensions", "complexity", "min", "max", "unit", "dimensionsMode", "description"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/aliasType.json
var aliasType_default = {
  "Simulink.AliasType": {
    props: [
      "baseType",
      "description",
      "dataScope",
      "headerFile"
    ],
    layout: [
      { group: "General", items: ["name", "baseType", "kind", "class"] },
      { group: "Value Properties", items: ["description"] },
      { group: "Code Generation", items: ["dataScope", "headerFile"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/numericType.json
var numericType_default = {
  "Simulink.NumericType": {
    props: [
      "description",
      "dataTypeMode",
      "signedness",
      "wordLength",
      "fractionLength",
      "slope",
      "bias",
      "dataTypeOverride",
      "isAlias",
      "dataScope",
      "headerFile"
    ],
    layout: [
      { group: "General", items: ["name", "kind", "class"] },
      { group: "Value Properties", items: ["dataTypeMode", "signedness", "wordLength", "fractionLength", "slope", "bias", "dataTypeOverride", "isAlias", "description"] },
      { group: "Code Generation", items: ["dataScope", "headerFile"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/enumType.json
var enumType_default = {
  "Simulink.data.dictionary.EnumTypeDefinition": {
    props: [
      "description",
      "storageType",
      "dataScope",
      "headerFile",
      "addClassNameToEnumNames",
      "isTunableInCode"
    ],
    layout: [
      { group: "General", items: ["name", "kind", "class"] },
      { group: "Value Properties", items: ["enumValue", "storageType", "description"] },
      { group: "Code Generation", items: ["dataScope", "headerFile", "addClassNameToEnumNames", "isTunableInCode"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/bus.json
var bus_default = {
  "Simulink.Bus": {
    props: [
      "description",
      "dataScope",
      "headerFile",
      "alignment",
      "preserveElementDimensions"
    ],
    layout: [
      { group: "General", items: ["name", "kind", "class"] },
      { group: "Value Properties", items: ["description"] },
      { group: "Code Generation", items: ["dataScope", "headerFile", "alignment", "preserveElementDimensions"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/connectionBus.json
var connectionBus_default = {
  "Simulink.ConnectionBus": {
    props: [
      "description"
    ],
    layout: [
      { group: "General", items: ["name", "kind", "class"] },
      { group: "Value Properties", items: ["description"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/serviceBus.json
var serviceBus_default = {
  "Simulink.ServiceBus": {
    props: [
      "description"
    ],
    layout: [
      { group: "General", items: ["name", "kind", "class"] },
      { group: "Value Properties", items: ["description"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/variantControl.json
var variantControl_default = {
  "Simulink.VariantControl": {
    props: [],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/variantExpression.json
var variantExpression_default = {
  "Simulink.VariantExpression": {
    props: [],
    layout: [
      { group: "General", items: ["name", "condition", "dataType", "kind", "class"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/variantVariable.json
var variantVariable_default = {
  "Simulink.VariantVariable": {
    props: ["bank"],
    layout: [
      { group: "General", items: ["name", "specification", "dataType", "kind", "class"] },
      { group: "Value Properties", items: ["bank"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/variantBank.json
var variantBank_default = {
  "Simulink.VariantBank": {
    props: [],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/variantBankCoderInfo.json
var variantBankCoderInfo_default = {
  "Simulink.VariantBankCoderInfo": {
    props: [],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/variantConfigurationData.json
var variantConfigurationData_default = {
  "Simulink.VariantConfigurationData": {
    props: [],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/configSet.json
var configSet_default = {
  "Simulink.ConfigSet": {
    props: [],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class", "description"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/configSetRef.json
var configSetRef_default = {
  "Simulink.ConfigSetRef": {
    props: ["sourceName"],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class", "sourceName", "description"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/lookupTable.json
var lookupTable_default = {
  "Simulink.LookupTable": {
    props: [
      "breakpointsSpecification",
      { $ref: "storageClass", options: ["Auto", "Model default", "ExportedGlobal", "ImportedExtern", "ImportedExternPointer", "BitField", "Const", "Volatile", "ConstVolatile", "Define", "ImportedDefine", "ExportToFile", "ImportFromFile", "FileScope", "Struct", "GetSet", "CompilerFlag"] },
      "structTypeName",
      "structTypeDataScope",
      "structTypeHeaderFile",
      "allowDifferentTableBpSizes",
      "supportTunableSize"
    ],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class", "description"] },
      { group: "Value Properties", items: ["breakpointsSpecification"] },
      { group: "Code Generation", items: ["storageClass", "structTypeName", "structTypeDataScope", "structTypeHeaderFile"] },
      { group: "Advanced", items: ["allowDifferentTableBpSizes", "supportTunableSize"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/breakpoint.json
var breakpoint_default = {
  "Simulink.Breakpoint": {
    props: [
      { $ref: "storageClass", options: ["Auto", "Model default", "ExportedGlobal", "ImportedExtern", "ImportedExternPointer", "BitField", "Const", "Volatile", "ConstVolatile", "Define", "ImportedDefine", "ExportToFile", "ImportFromFile", "FileScope", "Struct", "GetSet", "CompilerFlag"] },
      "structTypeName",
      "structTypeDataScope",
      "structTypeHeaderFile",
      "supportTunableSize"
    ],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class", "description"] },
      { group: "Code Generation", items: ["storageClass", "structTypeName", "structTypeDataScope", "structTypeHeaderFile"] },
      { group: "Advanced", items: ["supportTunableSize"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/classes/customObject.json
var customObject_default = {
  CustomObject: {
    props: [],
    layout: [
      { group: "General", items: ["name", "value", "dataType", "kind", "class", "description"] }
    ]
  }
};

// node_modules/data-explorer-core/dist/datamodel/schema/index.js
var REGISTRY = {
  ...core_default,
  ...dataObject_default,
  ...codeGen_default,
  ...typeObject_default
};
var CLASS_DEFS = {
  ...parameter_default,
  ...signal_default,
  ...valueType_default,
  ...aliasType_default,
  ...numericType_default,
  ...enumType_default,
  ...bus_default,
  ...connectionBus_default,
  ...serviceBus_default,
  ...variantControl_default,
  ...variantExpression_default,
  ...variantVariable_default,
  ...variantBank_default,
  ...variantBankCoderInfo_default,
  ...variantConfigurationData_default,
  ...configSet_default,
  ...configSetRef_default,
  ...lookupTable_default,
  ...breakpoint_default,
  ...customObject_default
};
var CLASS_ALIASES = {
  "Simulink.VariantConfigurations": "Simulink.VariantConfigurationData",
  "mpt.Parameter": "Simulink.Parameter",
  "mpt.Signal": "Simulink.Signal"
};
function classDef(className) {
  return CLASS_DEFS[className] ?? CLASS_DEFS[CLASS_ALIASES[className]];
}
var cache = /* @__PURE__ */ new Map();
function resolveRef(ref) {
  const key = typeof ref === "string" ? ref : ref.$ref;
  const base = REGISTRY[key];
  if (!base) {
    return null;
  }
  const override2 = typeof ref === "string" ? {} : ref;
  const merged = { ...base, ...override2 };
  delete merged.$ref;
  return { key, ...merged };
}
function getSchema(className) {
  if (cache.has(className)) {
    return cache.get(className);
  }
  const def = classDef(className);
  const resolved = def ? def.props.map(resolveRef).filter((p) => p !== null) : void 0;
  cache.set(className, resolved);
  return resolved;
}
function getLayout(className) {
  return classDef(className)?.layout;
}
function propertyBag(container, key) {
  if (key in container) {
    return container;
  }
  const inner = container._properties;
  if (inner && typeof inner === "object" && key in inner) {
    return inner;
  }
  const elements = container._elements;
  if (Array.isArray(elements) && elements[0] && typeof elements[0] === "object") {
    const elemProps = elements[0]._properties;
    if (elemProps && typeof elemProps === "object") {
      return elemProps;
    }
  }
  return container;
}
function unwrapScalar(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const o = value;
    if ("_type" in o && "_value" in o) {
      const t = String(o._type);
      if (/^u?int|^double$|^single$/.test(t)) {
        const n = Number(o._value);
        return Number.isNaN(n) ? o._value : n;
      }
      return o._value;
    }
  }
  return value;
}
function resolveSourcePath(properties, path) {
  if (!properties) {
    return void 0;
  }
  const parts = path.split(".");
  let current = properties;
  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === void 0 || typeof current !== "object") {
      return void 0;
    }
    const bag = propertyBag(current, parts[i]);
    current = bag[parts[i]];
  }
  return unwrapScalar(current);
}
function writableBag(container) {
  const inner = container._properties;
  if (inner && typeof inner === "object") {
    return inner;
  }
  const elements = container._elements;
  if (Array.isArray(elements) && elements[0] && typeof elements[0] === "object") {
    const elemProps = elements[0]._properties;
    if (elemProps && typeof elemProps === "object") {
      return elemProps;
    }
  }
  return container;
}
function writeSourcePath(properties, path, value) {
  if (!properties) {
    return false;
  }
  const parts = path.split(".");
  let current = properties;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = propertyBag(current, parts[i])[parts[i]];
    if (next === null || next === void 0 || typeof next !== "object") {
      return false;
    }
    current = next;
  }
  const leafKey = parts[parts.length - 1];
  const bag = writableBag(current);
  const existing = bag[leafKey];
  if (existing && typeof existing === "object" && !Array.isArray(existing) && "_type" in existing && "_value" in existing) {
    existing._value = String(value);
  } else {
    bag[leafKey] = value;
  }
  return true;
}
function hydrate(properties, prop2) {
  const raw = resolveSourcePath(properties, prop2.sourcePath);
  return raw === void 0 ? prop2.default : raw;
}

// node_modules/data-explorer-core/dist/datamodel/prop/formatText.js
function formatText(value) {
  return value ? String(value) : "";
}

// node_modules/data-explorer-core/dist/datamodel/prop/PropName.js
var PropName = class {
  static {
    this.key = "Name";
  }
  static {
    this.displayName = "Name";
  }
  static {
    this.editor = "text";
  }
  static {
    this.column = "Name";
  }
  static {
    this.nodeProperty = "name";
  }
  static {
    this.sourceKeys = ["Name"];
  }
  static readValue(node) {
    return node.displayName;
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/parser/XmlUtils.js
function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var SAVEOBJ_KEY = "_saveobj";
var CUSTOM_SAVE_KEY = "_custom_save";
function formatMatlabNum(num) {
  if (typeof num === "number" && !isFinite(num)) {
    return isNaN(num) ? "NaN" : num > 0 ? "Inf" : "-Inf";
  }
  return String(num);
}
function parseMatlabNum(text) {
  const t = text.trim();
  if (t === "Inf" || t === "+Inf") {
    return Infinity;
  }
  if (t === "-Inf") {
    return -Infinity;
  }
  if (t === "NaN") {
    return NaN;
  }
  const n = parseFloat(t);
  return isNaN(n) ? 0 : n;
}
function parseExactNum(text) {
  const t = text.trim();
  const num = parseMatlabNum(t);
  if (!/^[+-]?\d+$/.test(t)) {
    return num;
  }
  const canon = t.replace(/^\+/, "").replace(/^(-?)0+(?=\d)/, "$1");
  return String(num) === canon ? num : canon;
}
function exactInt(big) {
  const num = Number(big);
  return Number.isSafeInteger(num) ? num : big.toString();
}
function isExactToken(x) {
  return typeof x === "string" && /^-?\d+$/.test(x);
}
function needsExactInt(type) {
  return type === "int64" || type === "uint64";
}
function exactForClass(value, type) {
  if (!isExactToken(value)) {
    return value;
  }
  return needsExactInt(type) ? value : Number(value);
}
function formatDoubleXml(num) {
  if (typeof num === "string") {
    return num;
  }
  if (typeof num !== "number") {
    return formatMatlabNum(num);
  }
  if (!isFinite(num)) {
    return formatMatlabNum(num);
  }
  const s = String(num);
  if (!s.includes(".") && !s.includes("e") && !s.includes("E")) {
    return s + ".0";
  }
  return s;
}
function formatNumericXml(num, type) {
  if (typeof num === "string" && /^-?\d+$/.test(num)) {
    return num;
  }
  if (type === "double" || type === "single") {
    return formatDoubleXml(num);
  }
  return formatMatlabNum(Math.round(Number(num)));
}
function formatNumLiteral(num, type) {
  if (type === "single") {
    return formatMatlabNum(num) + "F";
  }
  if (type === "uint8" || type === "uint16" || type === "uint32" || type === "uint64") {
    return formatMatlabNum(num) + "U";
  }
  if (type === "double") {
    return formatDoubleXml(num);
  }
  return formatMatlabNum(num);
}
function formatMatrixSerial(values, dims, type) {
  const rows = dims[0];
  const cols = dims[1];
  const header = "Matrix(" + dims.join(",") + ")";
  if ((cols === 1 || rows === 1) && dims.length <= 2) {
    const flat = "[" + values.map((v) => formatNumLiteral(v, type)).join(", ") + "]";
    return rows === 1 ? flat : header + "\n" + flat;
  }
  const rowStrs = [];
  const pages = Math.max(1, Math.floor(values.length / Math.max(1, rows * cols)));
  for (let p = 0; p < pages; p++) {
    const base = p * rows * cols;
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(formatNumLiteral(values[base + r * cols + c], type));
      }
      rowStrs.push("[" + row.join(", ") + "]");
    }
  }
  return header + "\n[" + rowStrs.join("; ") + "]";
}
function charNeedsShape(dims) {
  return !(dims.length <= 2 && dims[0] === 1);
}
function charCodesRowMajor(text, dims) {
  const codes = [];
  for (let i = 0; i < text.length; i++) {
    codes.push(text.charCodeAt(i));
  }
  return transposeFromColumnMajorND(codes, dims);
}
function charTextFromCodes(rowMajorCodes, dims) {
  return transposeToColumnMajorND(rowMajorCodes, dims).map((c) => String.fromCharCode(c)).join("");
}
function formatMxCharSerial(text, dims) {
  const body = formatMatrixSerial(charCodesRowMajor(text, dims), dims, "mxchar");
  return body.indexOf("Matrix(") === 0 ? body : "Matrix(" + dims.join(",") + ")\n" + body;
}
function formatComplexXml(complexStr) {
  return complexStr.replace(/\.\d+(?:[eE][+-]?\d+)?|\d+\.?\d*(?:[eE][+-]?\d+)?/g, (num) => /[.eE]/.test(num) ? num : num + ".0");
}
function transposeToColumnMajorND(rowMajor, dims) {
  const rows = dims[0];
  const cols = dims[1];
  if (rows <= 1 || cols <= 1) {
    return rowMajor;
  }
  const page = rows * cols;
  const result = rowMajor.slice();
  for (let base = 0; base + page <= rowMajor.length; base += page) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result[base + c * rows + r] = rowMajor[base + r * cols + c];
      }
    }
  }
  return result;
}
function transposeFromColumnMajorND(colMajor, dims) {
  const rows = dims[0];
  const cols = dims[1];
  if (rows <= 1 || cols <= 1) {
    return colMajor;
  }
  const page = rows * cols;
  const result = colMajor.slice();
  for (let base = 0; base + page <= colMajor.length; base += page) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result[base + r * cols + c] = colMajor[base + c * rows + r];
      }
    }
  }
  return result;
}
function pad(indent) {
  return "    ".repeat(indent);
}
function matlabTimestampNow() {
  return (/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, ".000000");
}

// node_modules/data-explorer-core/dist/datamodel/parser/MatlabValueParser.js
function parse(str) {
  str = str.trim();
  if (str === "") {
    return null;
  }
  const ch = str.charAt(0);
  if (ch === "[") {
    return parseArray(str);
  }
  if (ch === "{") {
    return parseCell(str);
  }
  if (ch === "'") {
    return parseChar(str);
  }
  if (ch === '"') {
    return parseString(str);
  }
  if (str === "true") {
    return { type: "logical", value: true };
  }
  if (str === "false") {
    return { type: "logical", value: false };
  }
  const n = parseMatlabNumber(str);
  if (n !== null) {
    return { type: "double", value: n };
  }
  const complexResult = parseComplex(str);
  if (complexResult) {
    return complexResult;
  }
  return null;
}
function parseMatlabNumber(str) {
  const nonFinite = /^([+-]?)(Inf|NaN)$/.exec(str);
  if (nonFinite) {
    if (nonFinite[2] === "NaN") {
      return NaN;
    }
    return nonFinite[1] === "-" ? -Infinity : Infinity;
  }
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(str)) {
    return null;
  }
  const n = parseExactNum(str);
  return typeof n === "number" && isNaN(n) ? null : n;
}
function collapseExact(parsed) {
  if (parsed.type !== "double") {
    return parsed;
  }
  const collapse = (v) => typeof v === "string" ? Number(v) : v;
  return {
    ...parsed,
    value: Array.isArray(parsed.value) ? parsed.value.map(collapse) : collapse(parsed.value)
  };
}
function scanQuoted(str, start) {
  const q = str.charAt(start);
  let text = "";
  let i = start + 1;
  while (i < str.length) {
    const ch = str.charAt(i);
    if (ch === q) {
      if (str.charAt(i + 1) === q) {
        text += q;
        i += 2;
        continue;
      }
      return { text, next: i + 1 };
    }
    text += ch;
    i++;
  }
  return null;
}
function unquote(str, q) {
  if (str.charAt(0) !== q) {
    return null;
  }
  const scanned = scanQuoted(str, 0);
  return scanned && scanned.next === str.length ? scanned.text : null;
}
function formatMatlabChar(value) {
  return "'" + value.replace(/'/g, "''") + "'";
}
function formatMatlabString(value) {
  return '"' + value.replace(/"/g, '""') + '"';
}
function unquoteMatlabText(text) {
  const asChar = unquote(text, "'");
  if (asChar !== null) {
    return asChar;
  }
  const asString = unquote(text, '"');
  return asString !== null ? asString : text;
}
function parseChar(str) {
  const value = unquote(str, "'");
  return value === null ? null : { type: "char", value };
}
function parseString(str) {
  const value = unquote(str, '"');
  return value === null ? null : { type: "string", value };
}
function parseComplex(str) {
  const m = str.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([+-](?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)i$/);
  if (m) {
    const re = parseFloat(m[1]);
    const im = parseFloat(m[2]);
    const formatted = im >= 0 ? re + "+" + im + "i" : re + "" + im + "i";
    return { type: "complex", value: formatted };
  }
  const mi = str.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)i$/);
  if (mi) {
    const im = parseFloat(mi[1]);
    const formatted = "0" + (im >= 0 ? "+" + im + "i" : "" + im + "i");
    return { type: "complex", value: formatted };
  }
  return null;
}
function parseArray(str) {
  str = str.trim();
  if (str.length < 2 || str.charAt(0) !== "[" || str.charAt(str.length - 1) !== "]") {
    return null;
  }
  const inner = str.slice(1, -1).trim();
  if (inner === "") {
    return { type: "double", value: [], dims: [0, 0] };
  }
  const rows = splitRows(inner);
  const matrix = [];
  let cols = -1;
  let isStringArray = false;
  let anyDoubleQuoted = false;
  let allLogical = true;
  const charRows = [];
  for (let r = 0; r < rows.length; r++) {
    const rowStr = rows[r].trim();
    if (rowStr === "") {
      continue;
    }
    const scannedNums = tokenizeNumbers(rowStr);
    const nums = scannedNums && scannedNums.nums;
    if (scannedNums === null) {
      const scanned = tokenizeStrings(rowStr);
      if (scanned === null) {
        return null;
      }
      const strings = scanned.texts;
      if (!isStringArray && matrix.length > 0) {
        return null;
      }
      isStringArray = true;
      anyDoubleQuoted = anyDoubleQuoted || scanned.anyDouble;
      charRows.push(strings.join(""));
      if (cols < 0) {
        cols = strings.length;
      } else if (strings.length !== cols) {
        cols = -2;
      }
      matrix.push(strings);
    } else {
      if (isStringArray) {
        return null;
      }
      if (cols < 0) {
        cols = nums.length;
      } else if (nums.length !== cols) {
        return null;
      }
      allLogical = allLogical && scannedNums.allLogical;
      matrix.push(nums);
    }
  }
  if (matrix.length === 0) {
    return { type: "double", value: [], dims: [0, 0] };
  }
  if (isStringArray && !anyDoubleQuoted) {
    return charFromRows(charRows);
  }
  if (cols < 0) {
    return null;
  }
  if (isStringArray) {
    return { type: "string-array", value: flatten(matrix, cols, "column"), dims: [matrix.length, cols] };
  }
  const elements = flatten(matrix, cols, "row");
  if (allLogical) {
    return { type: "logical", value: elements, dims: [matrix.length, cols] };
  }
  return { type: "double", value: elements, dims: [matrix.length, cols] };
}
function flatten(matrix, cols, order) {
  const elements = [];
  if (order === "column") {
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < matrix.length; r++) {
        elements.push(matrix[r][c]);
      }
    }
    return elements;
  }
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < cols; c++) {
      elements.push(matrix[r][c]);
    }
  }
  return elements;
}
function charFromRows(rows) {
  const width = rows[0].length;
  for (let r = 1; r < rows.length; r++) {
    if (rows[r].length !== width) {
      return null;
    }
  }
  if (rows.length === 1 || width === 0) {
    return { type: "char", value: rows.length === 1 ? rows[0] : "" };
  }
  let text = "";
  for (let c = 0; c < width; c++) {
    for (let r = 0; r < rows.length; r++) {
      text += rows[r].charAt(c);
    }
  }
  return { type: "char", value: text, dims: [rows.length, width] };
}
function tokenizeStrings(rowStr) {
  const elements = [];
  let anyDouble = false;
  let i = 0;
  const len = rowStr.length;
  while (i < len) {
    while (i < len && (rowStr.charAt(i) === " " || rowStr.charAt(i) === ",")) {
      i++;
    }
    if (i >= len) {
      break;
    }
    const ch = rowStr.charAt(i);
    if (ch === '"' || ch === "'") {
      const scanned = scanQuoted(rowStr, i);
      if (!scanned) {
        return null;
      }
      if (ch === '"') {
        anyDouble = true;
      }
      elements.push(scanned.text);
      i = scanned.next;
    } else {
      return null;
    }
  }
  return elements.length > 0 ? { texts: elements, anyDouble } : null;
}
function parseCell(str) {
  str = str.trim();
  if (str.length < 2 || str.charAt(0) !== "{" || str.charAt(str.length - 1) !== "}") {
    return null;
  }
  const inner = str.slice(1, -1).trim();
  if (inner === "") {
    return { type: "cell", value: [], dims: [0, 0] };
  }
  const rows = splitRows(inner);
  const matrix = [];
  let cols = -1;
  for (let r = 0; r < rows.length; r++) {
    const rowStr = rows[r].trim();
    if (rowStr === "") {
      continue;
    }
    const elems = tokenizeCellElements(rowStr);
    if (elems === null) {
      return null;
    }
    if (cols < 0) {
      cols = elems.length;
    } else if (elems.length !== cols) {
      return null;
    }
    matrix.push(elems);
  }
  if (matrix.length === 0) {
    return { type: "cell", value: [], dims: [0, 0] };
  }
  return { type: "cell", value: flatten(matrix, cols, "column"), dims: [matrix.length, cols] };
}
function splitRows(inner) {
  const rows = [];
  let depth = 0;
  let start = 0;
  let i = 0;
  while (i < inner.length) {
    const ch = inner.charAt(i);
    if (ch === "'" || ch === '"') {
      const scanned = scanQuoted(inner, i);
      if (!scanned) {
        break;
      }
      i = scanned.next;
      continue;
    }
    if (ch === "[" || ch === "{") {
      depth++;
    } else if (ch === "]" || ch === "}") {
      depth--;
    } else if (ch === ";" && depth === 0) {
      rows.push(inner.slice(start, i));
      start = i + 1;
    }
    i++;
  }
  rows.push(inner.slice(start));
  return rows;
}
function tokenizeNumbers(rowStr) {
  const parts = rowStr.trim().split(/[,\s]+/);
  const nums = [];
  let allLogical = true;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === "") {
      continue;
    }
    if (parts[i] === "true" || parts[i] === "false") {
      nums.push(parts[i] === "true" ? 1 : 0);
      continue;
    }
    const n = parseMatlabNumber(parts[i]);
    if (n === null) {
      return null;
    }
    allLogical = false;
    nums.push(n);
  }
  return nums.length > 0 ? { nums, allLogical } : null;
}
function tokenizeCellElements(rowStr) {
  const elements = [];
  let i = 0;
  const len = rowStr.length;
  while (i < len) {
    while (i < len && (rowStr.charAt(i) === " " || rowStr.charAt(i) === ",")) {
      i++;
    }
    if (i >= len) {
      break;
    }
    const ch = rowStr.charAt(i);
    let span;
    if (ch === "'" || ch === '"') {
      const scanned = scanQuoted(rowStr, i);
      if (!scanned) {
        return null;
      }
      span = rowStr.slice(i, scanned.next);
      i = scanned.next;
    } else if (ch === "[" || ch === "{") {
      const end = findMatchingBracket(rowStr, i, ch, ch === "[" ? "]" : "}");
      if (end < 0) {
        return null;
      }
      span = rowStr.slice(i, end + 1);
      i = end + 1;
    } else {
      let end = i;
      while (end < len && rowStr.charAt(end) !== "," && rowStr.charAt(end) !== " " && rowStr.charAt(end) !== ";") {
        end++;
      }
      span = rowStr.slice(i, end);
      i = end;
    }
    const parsed = parse(span);
    if (parsed === null) {
      if (ch === "[" || ch === "{" || ch === "'" || ch === '"') {
        return null;
      }
      elements.push(span);
      continue;
    }
    elements.push(cellElementRaw(parsed));
  }
  return elements.length > 0 ? elements : null;
}
function cellElementRaw(parsed) {
  switch (parsed.type) {
    case "cell":
      return {
        _array_type: "Cell",
        _dimensions: parsed.dims,
        _elements: parsed.value,
        _mw_element_type: "MATLABArray"
      };
    case "string-array":
    case "string": {
      const elems = parsed.type === "string" ? [parsed.value] : parsed.value;
      return elems.length === 1 ? elems : {
        _array_type: "String",
        _dimensions: parsed.dims || [1, elems.length],
        _elements: elems,
        _mw_element_type: "MATLABArray"
      };
    }
    case "char":
      return parsed.dims ? { _type: "mxchar", _value: formatMxCharSerial(parsed.value, parsed.dims) } : parsed.value;
    case "logical":
      return Array.isArray(parsed.value) ? { _type: "logical", _value: formatMatrixSerial(parsed.value, parsed.dims, "logical") } : parsed.value;
    case "double": {
      const value = collapseExact(parsed).value;
      if (!Array.isArray(value)) {
        return value;
      }
      const dims = parsed.dims;
      return dims.length <= 2 && dims[0] <= 1 ? value : { _type: "double", _value: formatMatrixSerial(value, dims, "double") };
    }
    default:
      return parsed.value;
  }
}
function findMatchingBracket(str, start, open, close) {
  let depth = 0;
  let i = start;
  while (i < str.length) {
    const ch = str.charAt(i);
    if (ch === "'" || ch === '"') {
      const scanned = scanQuoted(str, i);
      if (!scanned) {
        return -1;
      }
      i = scanned.next;
      continue;
    }
    if (ch === open) {
      depth++;
    }
    if (ch === close) {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
    i++;
  }
  return -1;
}
function parsedIsScalarNumeric(parsed) {
  if (!parsed) {
    return false;
  }
  if (parsed.type === "double" || parsed.type === "logical") {
    if (Array.isArray(parsed.value)) {
      return parsed.value.length === 1;
    }
    return true;
  }
  return parsed.type === "complex";
}
var MatlabValueParser_default = {
  parse,
  parseArray,
  parseCell,
  parsedIsScalarNumeric,
  formatMatlabChar,
  formatMatlabString,
  unquoteMatlabText
};

// node_modules/data-explorer-core/dist/datamodel/display/DisplayConvention.js
var SUMMARY_MAX_CHARS = 1e3;
var SUMMARY_MAX_ELEMENTS = 10;
var MAX_EXPANDED_ELEMENTS = 1e4;
var EMPTY_NUMERIC = "[ ]";
var EMPTY_CELL = "{ }";
var MISSING_STRING = "<missing>";
function effectiveDims(dims) {
  if (!dims || dims.length === 0) {
    return [1, 1];
  }
  if (dims.length === 1) {
    return [1, dims[0]];
  }
  const d = dims.slice();
  while (d.length > 2 && d[d.length - 1] === 1) {
    d.pop();
  }
  return d;
}
function elementCount(dims) {
  return effectiveDims(dims).reduce(function(a, b) {
    return a * b;
  }, 1);
}
function needsSummary(dims) {
  const d = effectiveDims(dims);
  return d.length > 2 || elementCount(d) > SUMMARY_MAX_ELEMENTS;
}
function overCharBudget(text) {
  return text.length > SUMMARY_MAX_CHARS;
}
function summaryForm(dims, className) {
  return "<" + effectiveDims(dims).join("x") + " " + className + ">";
}

// node_modules/data-explorer-core/dist/datamodel/prop/PropValue.js
var PropValue = class {
  static {
    this.key = "Value";
  }
  static {
    this.displayName = "Value";
  }
  static {
    this.editor = "text";
  }
  static {
    this.column = "Value";
  }
  static readValue(node) {
    return node.displayValue;
  }
  static format(value) {
    if (value === null || value === void 0) {
      return EMPTY_NUMERIC;
    }
    if (typeof value === "number") {
      return formatMatlabNum(value);
    }
    if (typeof value === "boolean") {
      return String(value);
    }
    if (typeof value === "string") {
      return formatMatlabChar(value);
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return EMPTY_NUMERIC;
      }
      if (value.length === 1 && typeof value[0] === "string") {
        return formatMatlabString(value[0]);
      }
      const dims = [1, value.length];
      if (needsSummary(dims)) {
        return summaryForm(dims, "double");
      }
      const arrStr = "[" + value.map(formatMatlabNum).join(" ") + "]";
      return overCharBudget(arrStr) ? summaryForm(dims, "double") : arrStr;
    }
    return "";
  }
  static {
    this.unformat = unquoteMatlabText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropDataType.js
var PropDataType = class {
  static {
    this.key = "DataType";
  }
  static {
    this.displayName = "Data Type";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = "DataType";
  }
  static readValue(node) {
    return node.dataType;
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropKind.js
var PropKind = class {
  static {
    this.key = "Kind";
  }
  static {
    this.displayName = "Kind";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = null;
  }
  static readValue(node) {
    return node.kind;
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropClass.js
var PropClass = class {
  static {
    this.key = "Class";
  }
  static {
    this.displayName = "Class";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = null;
  }
  static readValue(node) {
    return node.className;
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropBaseType.js
var PropBaseType = class {
  static {
    this.key = "BaseType";
  }
  static {
    this.displayName = "Base Type";
  }
  static {
    this.editor = "text";
  }
  static {
    this.column = "DataType";
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropCondition.js
var PropCondition = class {
  static {
    this.key = "Condition";
  }
  static {
    this.displayName = "Condition";
  }
  static {
    this.editor = "text";
  }
  static {
    this.column = "Value";
  }
  // formatMatlabChar, not a bare concatenation: a condition containing a quote
  // (strcmp(mode,'fast') is an ordinary variant condition) has to display as the
  // literal that reads back as itself, or the text shown in the cell is not one
  // MATLAB can evaluate.
  static format(value) {
    return value ? formatMatlabChar(String(value)) : "";
  }
  static {
    this.unformat = unquoteMatlabText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropSpecification.js
var PropSpecification = class {
  static {
    this.key = "Specification";
  }
  static {
    this.displayName = "Specification";
  }
  static {
    this.editor = "text";
  }
  static {
    this.column = "Value";
  }
  // formatMatlabChar, not a bare concatenation: a specification containing a
  // quote has to display as the literal that reads back as itself ('it''s'), or
  // the text shown in the cell is not one MATLAB can evaluate.
  static format(value) {
    return value ? formatMatlabChar(String(value)) : "";
  }
  static {
    this.unformat = unquoteMatlabText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropEnumValue.js
var PropEnumValue = class {
  static {
    this.key = "Value";
  }
  static {
    this.displayName = "Value";
  }
  static {
    this.editor = "select";
  }
  static {
    this.column = "Value";
  }
  static {
    this.nodeProperty = "DefaultValue";
  }
  static readValue(node) {
    return node.displayValue;
  }
  static readOptions(node) {
    return node.children.map((c) => c.name);
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropMin.js
var PropMin = class {
  static {
    this.key = "Min";
  }
  static {
    this.displayName = "Minimum";
  }
  static {
    this.editor = "text";
  }
  static {
    this.column = "Min";
  }
  static format(value) {
    return value !== void 0 && value !== null ? String(value) : "";
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropMax.js
var PropMax = class {
  static {
    this.key = "Max";
  }
  static {
    this.displayName = "Maximum";
  }
  static {
    this.editor = "text";
  }
  static {
    this.column = "Max";
  }
  static format(value) {
    return value !== void 0 && value !== null ? String(value) : "";
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropUnit.js
var PropUnit = class {
  static {
    this.key = "Unit";
  }
  static {
    this.displayName = "Unit";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = "Unit";
  }
  static {
    this.sourceKeys = ["DocUnits", "Unit"];
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropDescription.js
var PropDescription = class {
  static {
    this.key = "Description";
  }
  static {
    this.displayName = "Description";
  }
  static {
    this.editor = "textArea";
  }
  static {
    this.column = "Description";
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/schemaBridge.js
var ATOM_BY_KEY = {
  name: PropName,
  value: PropValue,
  dataType: PropDataType,
  kind: PropKind,
  class: PropClass,
  baseType: PropBaseType,
  condition: PropCondition,
  specification: PropSpecification,
  enumValue: PropEnumValue,
  min: PropMin,
  max: PropMax,
  unit: PropUnit,
  description: PropDescription
};
function formatSchemaValue(value) {
  if (value === void 0 || value === null) {
    return "";
  }
  if (Array.isArray(value)) {
    return "[" + value.join(" ") + "]";
  }
  return String(value);
}
function toPropClass(prop2, column, editorOverride) {
  const pc = {
    key: prop2.key,
    displayName: prop2.label,
    column,
    editor: editorOverride ?? prop2.editor,
    // The top-level _properties key this prop reads through (e.g. 'CoderInfo'
    // for 'CoderInfo.StorageClass'). Lets the PI "Other" catch-all exclude the
    // whole bag this prop already surfaces.
    sourceKeys: [prop2.sourcePath.split(".")[0]],
    readValue: (node) => {
      const props = node.serial?._properties;
      return formatSchemaValue(hydrate(props, prop2));
    },
    format: (value) => formatSchemaValue(value)
  };
  if (prop2.options) {
    const opts = prop2.options;
    pc.readOptions = () => opts;
  }
  return pc;
}
function eligibleProps(className) {
  const resolved = getSchema(className);
  if (!resolved) {
    return [];
  }
  return resolved.filter((p) => p.projected === true);
}
function resolvePropForKey(schema, key) {
  const resolved = schema?.find((p) => p.key === key);
  return ATOM_BY_KEY[key] ?? (resolved && toPropClass(resolved, null, "label"));
}
function buildPILayout(className) {
  const layout = getLayout(className);
  if (!layout) {
    return null;
  }
  const schema = getSchema(className);
  return layout.map((g) => ({
    group: g.group,
    items: g.items.map((key) => resolvePropForKey(schema, key)).filter((pc) => pc !== void 0)
  }));
}
function schemaColumns(className) {
  return eligibleProps(className).map((prop2) => toPropClass(prop2, prop2.key));
}
function trySetSchemaProperty(node, key, stringValue) {
  const className = node.className;
  if (!className) {
    return null;
  }
  const resolved = getSchema(className);
  const prop2 = resolved?.find((p) => p.key === key && p.projected === true);
  if (!prop2 || prop2.editor === "label") {
    return null;
  }
  if (prop2.editor === "select") {
    const options = prop2.options ?? [];
    if (options.length > 0 && !options.includes(stringValue)) {
      return { error: true, reason: "Invalid value for " + prop2.label, invalidValue: stringValue, validValue: "" };
    }
  }
  const props = node.serial?._properties;
  const ok = writeSourcePath(props, prop2.sourcePath, stringValue);
  if (!ok) {
    return { error: true, reason: "Cannot set " + prop2.label + " (target property is absent)", invalidValue: stringValue, validValue: "" };
  }
  node._markModified?.();
  return true;
}

// node_modules/data-explorer-core/dist/datamodel/node/typeLinkCell.js
function splitTypeQualifier(text) {
  const colon = text.indexOf(":");
  if (colon < 0) {
    return { prefix: "", name: text.trim() };
  }
  const rest = text.slice(colon + 1);
  const lead = rest.length - rest.trimStart().length;
  return { prefix: text.slice(0, colon + 1 + lead), name: rest.trim() };
}
function typeLinkCell(cellText, resolve) {
  if (typeof cellText !== "string" || cellText === "") {
    return null;
  }
  const { prefix, name } = splitTypeQualifier(cellText);
  if (name === "") {
    return null;
  }
  const linkTarget = resolve(name);
  if (linkTarget === null || linkTarget === "") {
    return null;
  }
  return prefix === "" ? { text: name, linkTarget } : { prefix, text: name, linkTarget };
}

// node_modules/data-explorer-core/dist/datamodel/node/piOther.js
var ENVELOPE_KEYS = /* @__PURE__ */ new Set([
  "_id",
  "_object_class",
  "_array_class",
  "_array_type",
  "_dimensions",
  "_mw_element_type",
  "_type",
  "_value",
  "_properties",
  "_rawVal",
  "_elements",
  "_fields"
]);
function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function asTypedScalar(v) {
  if ("_value" in v && !isPlainObject(v._value) && !Array.isArray(v._value)) {
    return String(v._value);
  }
  return null;
}
function asNestedObject(v) {
  if (isPlainObject(v._properties)) {
    return { className: String(v._object_class ?? ""), props: v._properties };
  }
  return null;
}
function formatOther(v) {
  if (v === void 0 || v === null) {
    return "";
  }
  if (Array.isArray(v)) {
    return "[" + v.join(", ") + "]";
  }
  if (isPlainObject(v)) {
    const scalar = asTypedScalar(v);
    if (scalar !== null) {
      return scalar;
    }
    const obj = asNestedObject(v);
    if (obj) {
      return obj.className ? "[" + obj.className + "]" : "[object]";
    }
    return "";
  }
  return String(v);
}
function buildOtherRows(properties, shownKeys) {
  if (!isPlainObject(properties)) {
    return [];
  }
  const rows = [];
  for (const key of Object.keys(properties)) {
    if (shownKeys.has(key) || ENVELOPE_KEYS.has(key)) {
      continue;
    }
    const value = properties[key];
    if (isPlainObject(value)) {
      const scalar = asTypedScalar(value);
      if (scalar !== null) {
        rows.push({ name: key, value: scalar });
        continue;
      }
      const obj = asNestedObject(value);
      if (obj) {
        const subKeys = Object.keys(obj.props).filter((k) => !ENVELOPE_KEYS.has(k));
        if (subKeys.length === 0) {
          rows.push({ name: key, value: obj.className ? "[" + obj.className + "]" : "[object]" });
        } else {
          for (const subKey of subKeys) {
            rows.push({ name: key + "." + subKey, value: formatOther(obj.props[subKey]) });
          }
        }
        continue;
      }
      rows.push({ name: key, value: formatOther(value) });
      continue;
    }
    rows.push({ name: key, value: formatOther(value) });
  }
  return rows;
}

// node_modules/data-explorer-core/dist/datamodel/display/Subscript.js
function ind2sub(colMajorIndex, dims) {
  const d = effectiveDims(dims);
  const subs = [];
  let rest = colMajorIndex;
  for (let k = 0; k < d.length; k++) {
    subs.push(rest % d[k] + 1);
    rest = Math.floor(rest / d[k]);
  }
  return subs;
}
function toColumnMajorIndex(linearIndex, dims) {
  const rows = dims[0];
  const cols = dims[1];
  if (rows <= 1 || cols <= 1) {
    return linearIndex;
  }
  const page = rows * cols;
  const p = Math.floor(linearIndex / page);
  const within = linearIndex % page;
  const r = Math.floor(within / cols);
  const c = within % cols;
  return p * page + c * rows + r;
}
function subscriptLabel(name, linearIndex, dims, order, bracket) {
  const d = effectiveDims(dims);
  const open = bracket === "{}" ? "{" : "(";
  const close = bracket === "{}" ? "}" : ")";
  const spread = d.filter(function(n) {
    return n > 1;
  }).length;
  if (spread <= 1) {
    return name + open + (linearIndex + 1) + close;
  }
  const colMajor = order === "column-major" ? linearIndex : toColumnMajorIndex(linearIndex, d);
  return name + open + ind2sub(colMajor, d).join(",") + close;
}

// node_modules/data-explorer-core/dist/datamodel/node/BaseNode.js
var DEDICATED_COLUMNS = /* @__PURE__ */ new Set(["Name", "Value", "DataType", "Class", "Kind", "Description", "UsedBy", "Status"]);
var BaseNode = class {
  constructor(name, parent) {
    this.name = name;
    this.parent = parent;
    this.children = [];
  }
  get id() {
    return this.parent ? this.parent.id + "/" + this.name : this.name;
  }
  get icon() {
    return "wsDefault";
  }
  // The raw class identity (e.g. 'Simulink.Bus', 'double'), shown in the Class
  // column.
  get className() {
    return "";
  }
  // The user-facing Kind (e.g. 'Bus', 'MATLAB Variable'), shown in the Kind
  // column. Base nodes with no friendlier name fall back to the class identity.
  get kind() {
    return this.className;
  }
  // The value shown in the Data Type column. Base nodes carry no distinct data
  // type, so this falls back to the class identity; DataNode narrows this to a
  // real data type only (empty for object types).
  get dataType() {
    return this.className;
  }
  get displayValue() {
    return "";
  }
  get disabled() {
    return false;
  }
  // A positional element of a container whose parent is a bare array/cell/string:
  // its name is a synthetic index (1, 2, …), not a real identifier.
  get isIndexedName() {
    return !!(this.parent && (this.parent._kind === "cell" || this.parent._kind === "array" || this.parent._kind === "string"));
  }
  // The sole signal for graying a Name cell: this node's displayed name is a
  // synthetic positional subscript, not a user-assigned identifier. Covers bare
  // array/cell/string indices (isIndexedName), struct/object-array elements (which
  // carry an `_subscript` into their parent) and an explicit `_displayName` alias.
  // Structural and independent of file format — entries and struct FIELDS are never
  // elements, so they render normally.
  get isElementName() {
    return this.isIndexedName || !!this._subscript || !!this._displayName;
  }
  // True when this node's CHILDREN are the properties of a MATLAB class object
  // (ObjectNode overrides it). A class property's name is fixed by the class
  // definition, so — unlike a struct field — it can never be renamed. Children
  // consult `this.parent?.isObjectPropertyBag` in nameEditable. Kept as a getter
  // on BaseNode (rather than an `instanceof ObjectNode` check) to avoid the import
  // cycle ObjectNode → DataNode → BaseNode.
  get isObjectPropertyBag() {
    return false;
  }
  get nameEditable() {
    if (this.isIndexedName) {
      return false;
    }
    if (this._subscript || this._displayName) {
      return false;
    }
    if (this.parent?.isObjectPropertyBag) {
      return false;
    }
    return true;
  }
  // Called on a node after a structural edit added or removed a child of `child`
  // — i.e. one of ITS children changed shape, not this node's own list. Every node
  // ignores it: a tree row's existence is normally decided once, at parse time.
  // Simulink.Parameter is the exception, because its Value row exists only while
  // the value has something to expand into (see ParameterNode), so an edit two
  // levels down can add or remove that row.
  childStructureChanged(_child) {
  }
  canAddChild() {
    return false;
  }
  addChildNode() {
    return null;
  }
  addChild(child, index) {
    if (index !== void 0 && index >= 0) {
      this.children.splice(index, 0, child);
    } else {
      this.children.push(child);
    }
    child.parent = this;
    this._invalidateTypeLinkIndex();
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      child.parent = null;
      this._invalidateTypeLinkIndex();
    }
  }
  _replaceWith(newNode) {
    if (!this.parent) {
      return false;
    }
    const idx = this.parent.children.indexOf(this);
    if (idx < 0) {
      return false;
    }
    newNode.parent = this.parent;
    this.parent.children[idx] = newNode;
    this.parent = null;
    return true;
  }
  // Drop the source's cached type-definition index (see core/typeLinkIndex.ts).
  //
  // Invalidate-on-write, rebuild-on-read: one assignment here against one shallow walk on
  // the next row build, versus maintaining the set incrementally and needing every add,
  // remove, rename and undo path to be right forever. The rebuild also SELF-HEALS a hook
  // this class forgot to grow — the next unrelated edit corrects it — which an
  // incrementally-maintained set could not.
  //
  // Deliberately unconditional, unlike `dirty` below: a root that is not a source simply
  // gains a null property nothing reads, and guarding it would be a branch that exists to
  // protect nothing.
  _invalidateTypeLinkIndex() {
    let root = this;
    while (root.parent) {
      root = root.parent;
    }
    root._typeLinkIndex = null;
  }
  // Flag the owning file as having unsaved changes. The `dirty` flag lives on the
  // source root (SlddNode/MatNode/ModelNode) — the node that knows about a file —
  // so any mutation deep in the tree has to walk up to find it. Silently does
  // nothing when the node is detached or the root is not a source (a bare subtree
  // in a test, or a section whose parent is not yet attached): a mutation with no
  // file behind it has nothing to mark.
  _markSourceDirty() {
    let root = this;
    while (root.parent) {
      root = root.parent;
    }
    const source = root;
    if (source.dirty !== void 0) {
      source.dirty = true;
    }
    this._invalidateTypeLinkIndex();
  }
  // The `UsedBy` cell for this node, or undefined when there is nothing to say.
  //
  // ABSENT, rather than `{ links: [] }` or `''`, for a definition nothing references —
  // and absent for every node the column means nothing for, a struct field, a bus
  // element, a block or an external-data file row among them (findUsages answers all of
  // those with nothing, deliberately: the file-level reverse direction is not part of
  // it). The two absences are NOT distinguished, because a row cannot honestly
  // distinguish them: with no model open, every definition in a dictionary has zero
  // usages, so an empty list would render an emphatic "nothing uses this" over a file
  // whose users are merely not open yet. Absence is not a claim. It is the same rule
  // registerSource applies to `warnings` — say something only when there is something to
  // say — and it is why a host must not read a missing cell as "unused".
  //
  // The text is the block's NAME and nothing else. Of the four facts a usage carries it
  // is the only one that is a display name at all: `blockType` is a Simulink class token,
  // `paramProperty` and `paramValue` are code, and `modelSrcId` is the HOST's key for a
  // file, which may be a full path or a URI with credentials in it and has no business in
  // a table cell. This is the data model's DEFAULT, not an opinion about what the column
  // should read: a host that wants 'Const (Constant)', 'mdlcases.mdl: Const' or '3
  // blocks' calls session.findUsages(nodeId) and builds its own cell from the four facts,
  // which is why NodeUsage pre-bakes no text. The cost is accepted and worth naming: two
  // blocks of the same name in two models render the same text and differ only in their
  // linkTarget.
  //
  // `linkTarget` is the usage's own, verbatim — resolveLink() turns it back into the
  // block node, so the cell is clickable with no second target grammar and nothing for
  // the host to assemble.
  _usedByCell() {
    let root = this;
    while (root.parent) {
      root = root.parent;
    }
    const resolve = root._usageResolver;
    if (typeof resolve !== "function") {
      return void 0;
    }
    const usages = resolve(this.id);
    if (!usages || usages.length === 0) {
      return void 0;
    }
    return { links: usages.map((u) => ({ text: u.blockName, linkTarget: u.linkTarget })) };
  }
  // The Data Type cell's link, or undefined when the cell stays the plain string it
  // already is. The forward mirror of _usedByCell above, reached the same way: walk to the
  // source root, read the callback the session stamped there, and stay silent when there
  // is none (a bare subtree in a test, a node detached mid-edit).
  //
  // Takes the cell TEXT rather than reading `this.dataType`, and that is the whole point
  // of the method: `row.DataType` is written on two different lines of toRow — the schema
  // prop loop for a class whose schema lists dataType, the fallback for one whose schema
  // does not — and re-deriving the value here would be a third reading of it, free to
  // disagree with both. One post-step over whatever landed in the cell cannot.
  _typeLinkCell(cellText) {
    if (typeof cellText !== "string" || cellText === "") {
      return void 0;
    }
    let root = this;
    while (root.parent) {
      root = root.parent;
    }
    const resolve = root._typeLinkResolver;
    if (typeof resolve !== "function") {
      return void 0;
    }
    return typeLinkCell(cellText, resolve) ?? void 0;
  }
  flatten() {
    const result = [];
    const stack = [this];
    while (stack.length > 0) {
      const node = stack.pop();
      result.push(node);
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
    return result;
  }
  // Which slot of its parent this node occupies — O(1) where it can be, O(n) where it
  // has to be, and it decides which by CHECKING.
  //
  // An element's `name` already is its 1-based slot: every builder stamps String(i+1),
  // and _buildArrayChildren is now the only one that does. So the slot can be read
  // instead of searched. But `name` is data — nothing reindexes it when children are
  // reordered — so a derived index is a guess until the slot it names is confirmed to
  // hold THIS node. Confirmed, it is the answer; unconfirmed, the scan still is.
  //
  // This replaced a bare `children.indexOf(this)`, which is O(n) per element and so
  // O(n^2) per array. Measured on the 1000x1000 double that prompted this: 1.5 us at
  // index 0 rising to 325 us at index 999,999, ~161 s to label one entry, which was
  // most of the time the file spent failing to open. Eight lines below, the
  // struct/object-element path was already doing it this way (a stored
  // `_subscript.index`) and was 2000x faster on the same data — the two paths
  // answering one question two ways, with only one of them fast.
  _slotAmongSiblings() {
    const siblings = this.parent.children;
    const named = Number(this.name) - 1;
    if (named >= 0 && named < siblings.length && siblings[named] === this) {
      return named;
    }
    return siblings.indexOf(this);
  }
  get displayName() {
    if (this.parent && (this.parent._kind === "cell" || this.parent._kind === "array" || this.parent._kind === "string")) {
      return subscriptLabel(this.parent.displayName, this._slotAmongSiblings(), this.parent._dims, this.parent._kind === "array" ? "row-major" : "column-major", this.parent._kind === "cell" ? "{}" : "()");
    }
    if (this._subscript && this.parent) {
      const s = this._subscript;
      return subscriptLabel(this.parent.displayName, s.index, s.dims, s.order, s.bracket);
    }
    return this._displayName || this.name;
  }
  get valueEditable() {
    const v = this.displayValue;
    if (v && v.charAt(0) === "<" && v.charAt(v.length - 1) === ">") {
      return false;
    }
    return true;
  }
  // Whether a Description typed onto this row could be SAVED — the third member of the
  // nameEditable/valueEditable family, and one for the same reason: the Description
  // column exists for every row, but only a node that serializes a MATLAB property bag
  // has anywhere to put one. A plain variable (and a struct) goes out as
  // `{name, metadata, value}`, so a Description set on it showed in the cell and was
  // gone on the next read of the file.
  //
  // True here, false in the two classes that cannot hold one, rather than the other way
  // round: every Simulink object can be described, and a new class that cannot has to
  // say so — which is the same direction nameEditable and valueEditable are declared in.
  //
  // It used to be answered by `valueEditable`, which is a different question: a
  // Parameter whose value displays as a `<1x12 double>` summary takes no value editor
  // and can still be described.
  get descriptionEditable() {
    return true;
  }
  getPropInfo(PropClassRef) {
    const key = PropClassRef.key;
    let displayValue;
    if (PropClassRef.readValue) {
      displayValue = PropClassRef.readValue(this);
    } else {
      displayValue = PropClassRef.format(this[key]);
    }
    let editable = PropClassRef.editor !== "label";
    if (key === "Name") {
      editable = editable && this.nameEditable;
    }
    if (key === "Value") {
      editable = editable && this.valueEditable;
    }
    if (key === "Description") {
      editable = editable && this.descriptionEditable;
    }
    return {
      key,
      displayName: PropClassRef.displayName,
      value: this[PropClassRef.nodeProperty || key],
      displayValue,
      editable,
      editor: PropClassRef.editor,
      options: PropClassRef.readOptions ? PropClassRef.readOptions(this) : void 0
    };
  }
  // `pool`, when a caller building MANY rows brings one, shares each cell with the rows
  // that already hold the same value — 566 bytes per row down to 314 on a large
  // dictionary. Optional, and absent it this returns exactly what it always did: the
  // pooling is one call at the bottom of this method, over the finished row, so there is
  // no second construction path that could disagree about a value. See RowCellPool.
  toRow(pool) {
    const parentId = this.parent && !this.parent.isContainer ? this.parent.id : null;
    const props = this.getProperties();
    const row = {
      ID: this.id,
      parent: parentId,
      Status: this.status || ""
    };
    for (let i = 0; i < props.length; i++) {
      const info = this.getPropInfo(props[i]);
      const column = props[i].column;
      if (column === null) {
        continue;
      }
      const colKey = column || info.key;
      if (colKey === "Name") {
        row.Name = { label: info.displayValue, iconId: this.icon, disabled: this.disabled, editable: info.editable, element: this.isElementName };
      } else if (colKey === "Value") {
        if (info.editor === "select") {
          row.Value = { text: info.displayValue, editable: info.editable, editor: "select", options: info.options || [] };
        } else {
          row.Value = info.displayValue;
        }
        row._valueEditable = info.editable;
      } else if (info.editable && !DEDICATED_COLUMNS.has(colKey)) {
        row[colKey] = { text: info.displayValue, editable: true, editor: info.editor, options: info.options };
      } else {
        row[colKey] = info.displayValue;
      }
    }
    if (!row.Name) {
      row.Name = { label: this.displayName, iconId: this.icon, disabled: this.disabled, editable: this.nameEditable, element: this.isElementName };
    }
    if (!("Value" in row)) {
      row.Value = this.displayValue;
      row._valueEditable = this.valueEditable;
    }
    if (!("DataType" in row)) {
      row.DataType = this.dataType;
    }
    if (!("Class" in row)) {
      row.Class = this.className;
    }
    if (!("Kind" in row)) {
      row.Kind = this.kind;
    }
    if (!("Description" in row)) {
      row.Description = this.Description || "";
    }
    row._descriptionEditable = this.descriptionEditable;
    const usedBy = this._usedByCell();
    if (usedBy !== void 0) {
      row.UsedBy = usedBy;
    }
    const typeLink = this._typeLinkCell(row.DataType);
    if (typeLink !== void 0) {
      row.DataType = typeLink;
    }
    return pool ? pool.share(row) : row;
  }
  getProperties() {
    return [];
  }
  // The Property Inspector layout (ordered groups → props). Default: the
  // declarative schema layout for this node's class, when one exists (see
  // schema/classes/*.json + buildPILayout). Node subclasses without a schema
  // layout override this to author their groups directly; a subclass may also
  // override to fully replace the schema-driven layout. Returns null when neither
  // a schema layout nor an override applies → no curated groups (toPIObject may
  // still show the "Other" group).
  getPILayout() {
    return buildPILayout(this.className);
  }
  toPIObject() {
    const layout = this.getPILayout();
    if (!layout) {
      return null;
    }
    const properties = [];
    const groups = [];
    const obj = { _id: { nodeId: this.id } };
    const shownKeys = /* @__PURE__ */ new Set();
    for (let g = 0; g < layout.length; g++) {
      const groupDef = layout[g];
      const groupItems = [];
      for (let i = 0; i < groupDef.items.length; i++) {
        const PropClassRef = groupDef.items[i];
        const info = this.getPropInfo(PropClassRef);
        const piColumn = PropClassRef.column;
        const colKey = piColumn === null ? null : piColumn || info.key;
        const typeLink = colKey === "DataType" ? this._typeLinkCell(info.displayValue) : void 0;
        const valueLink = typeLink && typeof typeLink === "object" && typeof typeLink.linkTarget === "string" ? typeLink.linkTarget : void 0;
        properties.push({
          name: info.key,
          displayName: info.displayName,
          dataType: info.editor === "bool" ? "logical" : "char",
          renderer: info.editable ? "rendererseditors/editors/TextBoxEditor" : "rendererseditors/editors/LabelEditor",
          inPlaceEditor: info.editable ? "rendererseditors/editors/TextBoxEditor" : null,
          editor: null,
          editable: info.editable,
          valid: true,
          ...valueLink === void 0 ? {} : { valueLink }
        });
        groupItems.push({ name: info.key, type: "property" });
        obj[info.key] = info.displayValue;
        const keys = PropClassRef.sourceKeys ?? [PropClassRef.nodeProperty ?? PropClassRef.key];
        for (const k of keys) {
          shownKeys.add(k);
        }
      }
      const displayName = groupDef.group.replace("{name}", this.displayName);
      groups.push({
        name: displayName.replace(/[^A-Za-z0-9]+/g, "") + "Group",
        type: "group",
        displayName,
        items: groupItems,
        expanded: true
      });
    }
    const rawProps = this.serial?._properties;
    const otherRows = buildOtherRows(rawProps, shownKeys);
    if (otherRows.length > 0) {
      const otherItems = [];
      for (const row of otherRows) {
        const propName2 = "Other." + row.name;
        properties.push({
          name: propName2,
          displayName: row.name,
          dataType: "char",
          renderer: "rendererseditors/editors/LabelEditor",
          inPlaceEditor: null,
          editor: null,
          editable: false,
          valid: true
        });
        otherItems.push({ name: propName2, type: "property" });
        obj[propName2] = row.value;
      }
      groups.push({
        name: "OtherGroup",
        type: "group",
        displayName: "Other",
        items: otherItems,
        expanded: false
      });
    }
    return {
      propertySheet: { properties, groups },
      objects: [obj],
      showGroups: true,
      showDefaultGroup: false
    };
  }
  serialize() {
    return null;
  }
};

// node_modules/data-explorer-core/dist/datamodel/parser/CdataCodec.js
var MAT_CDATA_PREFIX = "  %)";
function isMatCdata(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const v = value._value;
  return typeof v === "string" && v.indexOf(MAT_CDATA_PREFIX) === 0;
}
function uudecode(str) {
  const bits2 = [];
  for (let i = 0; i < str.length; i++) {
    const v = str.charCodeAt(i) - 32;
    for (let b = 5; b >= 0; b--) {
      bits2.push(v >> b & 1);
    }
  }
  const bytes = new Uint8Array(Math.floor(bits2.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = byte << 1 | bits2[i * 8 + b];
    }
    bytes[i] = byte;
  }
  return bytes;
}
function uuencode(bytes) {
  const chars = [];
  const dataChars = Math.ceil(bytes.length * 8 / 6);
  for (let i = 0; i < dataChars; i++) {
    let v = 0;
    for (let b = 0; b < 6; b++) {
      const bit = i * 6 + b;
      const byte = bit >> 3;
      const inByte = 7 - (bit & 7);
      v = v << 1 | (byte < bytes.length ? bytes[byte] >> inByte & 1 : 0);
    }
    chars.push(String.fromCharCode(32 + v));
  }
  while (chars.length % 4 !== 0) {
    chars.push("\0");
  }
  chars.push("\0");
  return chars.join("");
}

// node_modules/data-explorer-core/dist/datamodel/kindMap.js
var KIND_BY_CLASS = {
  "Simulink.Parameter": "Simulink Parameter",
  "Simulink.Signal": "Simulink Signal",
  // The Embedded Coder subclasses take their superclass's Kind rather than a
  // label of their own, on the same terms as Simulink.VariantConfigurations
  // below: the Kind column answers "what sort of thing is this", and an
  // mpt.Parameter is a Simulink Parameter with extra code-generation properties.
  // Nothing is hidden by sharing the label — the Class column still carries the
  // true identity, which is where a user looks to tell the two apart.
  "mpt.Parameter": "Simulink Parameter",
  "mpt.Signal": "Simulink Signal",
  "Simulink.LookupTable": "Lookup Table",
  "Simulink.Breakpoint": "Breakpoint",
  "Simulink.Bus": "Bus",
  "Simulink.BusElement": "Bus Element",
  "Simulink.ConnectionBus": "Connection Bus",
  "Simulink.ConnectionElement": "Connection Element",
  "Simulink.ServiceBus": "Service Interface",
  "Simulink.FunctionElement": "Function Element",
  "Simulink.ValueType": "Value Type",
  "Simulink.AliasType": "Alias Type",
  "Simulink.NumericType": "Numeric Type",
  "Simulink.data.dictionary.EnumTypeDefinition": "Enumerated Type",
  "Simulink.VariantExpression": "Variant Expression",
  "Simulink.VariantControl": "Variant Control",
  "Simulink.VariantVariable": "Variant Variable",
  "Simulink.VariantBank": "Variant Bank",
  "Simulink.VariantBankCoderInfo": "Variant Bank Coder Info",
  "Simulink.VariantConfigurationData": "Variant Configuration",
  "Simulink.VariantConfigurations": "Variant Configuration",
  "Simulink.ConfigSet": "Configuration Set",
  "Simulink.ConfigSetRef": "Configuration Reference"
};
var DERIVED_KIND_BY_CLASS = {
  "Simulink.Bus": "Data Interface",
  "Simulink.ConnectionBus": "Physical Interface"
};
var KIND_BY_CLASSIFICATION = {
  DataInterface: "Data Interface",
  PhysicalInterface: "Physical Interface",
  ServiceInterface: "Service Interface",
  ValueType: "Value Type",
  StructType: "Struct Type",
  NumericType: "Numeric Type",
  EnumType: "Enumerated Type",
  AliasType: "Alias Type"
};
function matlabVariableKind(isDerived) {
  return isDerived ? "Constant" : "MATLAB Variable";
}

// node_modules/data-explorer-core/dist/datamodel/node/DataNode.js
function formatMatlabTimestamp(raw) {
  if (!raw || raw.length < 15) {
    return raw || "";
  }
  const year = raw.substring(0, 4);
  const month = raw.substring(4, 6);
  const day = raw.substring(6, 8);
  const hour = raw.substring(9, 11);
  const min = raw.substring(11, 13);
  const sec = raw.substring(13, 15);
  return year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec + "Z";
}
var MATLAB_NAME_RE = /^[A-Za-z][A-Za-z0-9_]*$/;
var MATLAB_KEYWORDS = /* @__PURE__ */ new Set([
  "break",
  "case",
  "catch",
  "classdef",
  "continue",
  "else",
  "elseif",
  "end",
  "for",
  "function",
  "global",
  "if",
  "otherwise",
  "parfor",
  "persistent",
  "return",
  "spmd",
  "switch",
  "try",
  "while"
]);
function validateMatlabName(name) {
  if (!name || !name.trim()) {
    return "Name cannot be empty";
  }
  if (!MATLAB_NAME_RE.test(name)) {
    return "Invalid MATLAB name. Must start with a letter and contain only letters, digits, and underscores";
  }
  if (name.length > 63) {
    return "Name exceeds maximum length of 63 characters";
  }
  if (MATLAB_KEYWORDS.has(name)) {
    return "'" + name + "' is a reserved MATLAB keyword";
  }
  return null;
}
function writeIntoSaveobj(envelope, key, val) {
  if (!envelope || typeof envelope !== "object") {
    return envelope;
  }
  const env = envelope;
  const fields = env._fields;
  const elements = env._elements;
  if (!Array.isArray(fields) || !fields.includes(key)) {
    return envelope;
  }
  if (!Array.isArray(elements) || elements.length !== 1) {
    return envelope;
  }
  const el = elements[0];
  if (!el || typeof el !== "object") {
    return envelope;
  }
  return Object.assign({}, env, {
    _elements: [Object.assign({}, el, { [key]: val })]
  });
}
function owningEntryOf(node) {
  let entry = node;
  while (entry && !entry.isEntry) {
    entry = entry.parent;
  }
  return entry ?? null;
}
var DataNode = class _DataNode extends BaseNode {
  constructor(name, parent, serial) {
    super(name, parent);
    this.metadata = null;
    this.serial = serial || {};
    this.status = "";
  }
  // Each data node captures three distinct concepts, one per column:
  //   • className — the raw class identity (e.g. 'Simulink.Bus', 'double').
  //   • kind      — the user-facing name (e.g. 'Bus', 'MATLAB Variable').
  //   • dataType  — a real data type only (e.g. 'double', 'int8'), or empty.
  // These never mix: the Class column shows className, the Kind column shows
  // kind, and the Data Type column shows dataType.
  // The user-facing Kind. A classified entry's Kind comes from its classification
  // token; otherwise it is derived from the Class. Nodes with no known mapping
  // fall back to their raw class name.
  get kind() {
    if (this.classification) {
      return KIND_BY_CLASSIFICATION[this.classification] || this.classification;
    }
    const cls = this.className;
    if (this.isDerived && DERIVED_KIND_BY_CLASS[cls]) {
      return DERIVED_KIND_BY_CLASS[cls];
    }
    return KIND_BY_CLASS[cls] || cls;
  }
  // The value shown in the Data Type column. This column shows a real data type
  // only; it never surfaces the node's Class (the class identity, e.g.
  // 'Simulink.Bus') or its Kind. Object-type nodes therefore show nothing here
  // by default; only nodes that carry a genuine data type (primitive variables,
  // structs, bus elements, value types) override this.
  get dataType() {
    return "";
  }
  get isEntry() {
    return !!(this.parent && this.parent.isContainer);
  }
  /** The entry this node belongs to — itself when it IS one, null when none is above it. */
  get owningEntry() {
    return owningEntryOf(this);
  }
  // isIndexedName is inherited from BaseNode (structural: parent is array/cell/
  // string), as is nameEditable — see the note below.
  get isDerived() {
    return !!(this.metadata && this.metadata.isderived === "1");
  }
  // The entry's last-modified timestamp, normalized to a single display string
  // across the two parse paths. The text `.sldd` path stores a raw MATLAB
  // timestamp under `lastmod` (also the shape freshly-added entries use); the
  // binary path pre-formats it to ISO under `lastModifiedDate` and keeps the raw
  // string under `_rawLastMod`. We prefer whichever ISO value exists and fall
  // back to formatting the raw one, so both formats render identically. Empty
  // when the entry carries no timestamp (e.g. nested children).
  get lastModified() {
    const m = this.metadata;
    if (!m) {
      return "";
    }
    const iso = m.lastModifiedDate;
    if (typeof iso === "string" && iso) {
      return iso;
    }
    const raw = m.lastmod ?? m._rawLastMod;
    return typeof raw === "string" ? formatMatlabTimestamp(raw) : "";
  }
  // The user who last modified the entry. The text path stores it under
  // `modifiedby`, the binary path under `lastModifiedBy`; new entries leave it
  // empty. Empty when absent.
  get lastModifiedBy() {
    const m = this.metadata;
    if (!m) {
      return "";
    }
    const by = m.lastModifiedBy ?? m.modifiedby;
    return typeof by === "string" ? by : "";
  }
  // nameEditable is inherited from BaseNode: the things that fix a name — a
  // synthetic positional index, an element subscript, a `_displayName` alias, and an
  // object-property-bag parent — are all structural, so the base rule already covers
  // every data node.
  get disabled() {
    return !this.isEntry;
  }
  // The prop atom `propName` names — by its own key or by the column it renders
  // into, which is how an edit committed in the 'Value' column reaches the atom
  // that actually owns it (a Variant's Condition/Specification). Undefined when
  // this node has no such prop.
  _propFor(propName2) {
    return this.getProperties().find((prop2) => prop2.key === propName2 || prop2.column === propName2);
  }
  _resolveProperty(propName2) {
    const prop2 = this._propFor(propName2);
    if (!prop2) {
      return propName2;
    }
    return prop2.nodeProperty || prop2.key;
  }
  setProperty(propName2, stringValue) {
    const schemaResult = trySetSchemaProperty(this, propName2, stringValue);
    if (schemaResult !== null) {
      return schemaResult;
    }
    const resolved = this._resolveProperty(propName2);
    if (resolved === "name") {
      if (!this.nameEditable) {
        return {
          error: true,
          reason: `'${this.displayName}' is not a name this entry can carry, so it cannot be renamed.`,
          invalidValue: stringValue,
          validValue: this.displayName
        };
      }
      const error = validateMatlabName(stringValue);
      if (error) {
        return { error: true, reason: error, invalidValue: stringValue, validValue: this.name };
      }
      if (this.parent && this.parent.children) {
        const nsNames = this.parent._namespaceEntryNames;
        const duplicate = typeof nsNames === "function" ? nsNames.call(this.parent).some((n) => n !== this.name && n === stringValue) : this.parent.children.some((sibling) => sibling !== this && sibling.name === stringValue);
        if (duplicate) {
          return {
            error: true,
            reason: "'" + stringValue + "' already exists in Design or Architectural Data",
            invalidValue: stringValue,
            validValue: this.name
          };
        }
      }
      const oldName = this.name;
      this.name = stringValue;
      const renameField = this.parent?._renameField;
      if (typeof renameField === "function") {
        renameField.call(this.parent, oldName, stringValue);
      }
      const entryRenamed = this.parent?._entryRenamed;
      if (typeof entryRenamed === "function") {
        entryRenamed.call(this.parent, oldName, stringValue);
      }
      this._markModified();
      return true;
    }
    if (resolved === "Description" && !this.descriptionEditable) {
      return {
        error: true,
        reason: `A ${this.kind || "value"} has no Description in a dictionary, so one cannot be saved for '${this.displayName}'.`,
        invalidValue: stringValue,
        validValue: this.Description || ""
      };
    }
    const self = this;
    const current = self[resolved];
    const type = typeof current;
    if (type === "number") {
      const num = Number(stringValue);
      if (Number.isNaN(num)) {
        return {
          error: true,
          reason: "Expected a numeric value",
          invalidValue: stringValue,
          validValue: String(current)
        };
      }
      self[resolved] = num;
    } else if (type === "boolean") {
      self[resolved] = stringValue === "true";
    } else {
      const unformat = this._propFor(propName2)?.unformat;
      self[resolved] = unformat ? unformat(stringValue) : stringValue;
    }
    this._markModified();
    return true;
  }
  // Apply an edit to the node-owned Min/Max value property, mirroring the exact
  // constraint Simulink.DataObject/setPropValue enforces (verified against MATLAB
  // BR2025ad: see test/parity/gen_propconstraints_probe.m). MATLAB requires a
  // "finite real double scalar value" — so we accept a lone real finite number
  // and reject arrays, Inf/-Inf, NaN, complex, and non-numeric text. An empty
  // string or '[]' clears the bound (MATLAB stores []). NOTE: MATLAB does NOT
  // enforce Min <= Max (it accepts Min=5, Max=1), so we deliberately impose no
  // cross-check — matching the object exactly rather than being stricter.
  _setMinMax(propName2, stringValue) {
    const self = this;
    const trimmed = stringValue.trim();
    if (trimmed === "" || trimmed === "[]") {
      self[propName2] = void 0;
      this._markModified();
      return true;
    }
    const label = propName2 === "Min" ? "Minimum" : "Maximum";
    const num = Number(trimmed);
    if (!Number.isFinite(num)) {
      const cur = self[propName2];
      return {
        error: true,
        reason: label + " must be a finite real double scalar value",
        invalidValue: stringValue,
        validValue: cur !== void 0 ? String(cur) : "[]"
      };
    }
    self[propName2] = num;
    this._markModified();
    return true;
  }
  // MATLAB's empty bound is `[]`, and `[]` is truthy: left as it arrives it reaches
  // the table as the text `[]` and the writers as a real value, so a class holding a
  // bound as a node field normalizes it to `undefined` on the way in — the same
  // "no bound" _setMinMax above stores for a cleared cell. Shared rather than
  // per-class so the two ends of that round trip cannot disagree about what an
  // absent bound is: ParameterNode, BusElementNode and ValueTypeNode all call it, and
  // the first two each carried an identical private copy until the third needed one.
  static _normalizeMinMax(val) {
    if (Array.isArray(val) && val.length === 0) {
      return void 0;
    }
    return val;
  }
  // Refuse a value MATLAB's enum does not contain, for any property surfaced as a
  // dropdown (Complexity, DimensionsMode). Without this the edit reaches the generic
  // branch for a string field above, which stores whatever text arrived: the table's
  // own combobox can only offer legal choices, but the Property Inspector has no
  // combobox and seeds a plain text box, so 'Real' or 'fixed' would be written into a
  // file MATLAB then refuses to load — the failure an unlock has to rule out before
  // it is an unlock at all.
  //
  // The legal set is read off the prop atom's readOptions — the SAME call the
  // cell's dropdown is built from (BaseNode.getPropInfo) — rather than restated
  // here. Two copies of an enum is how a UI ends up offering two choices and
  // accepting three.
  //
  // The wording is MATLAB's own, from a probe of the live object (recorded in
  // Simulink.BusElement.md): assigning anything else raises "There is no
  // enumerated value named 'X'." Note this is MATLAB's message for a rejected
  // ASSIGNMENT; that the values we do accept produce a file MATLAB reopens with
  // the same values is the live tier's claim to make, and it has not been run
  // here (test/parity/matlab/writeback.live.test.ts, gated on DEX_MATLAB_CMD).
  //
  // Lives here beside _setMinMax, rather than on BusElementNode where it started with
  // one caller, because Simulink.ValueType's Complexity/DimensionsMode are the same
  // two closed enums and need the same rule. Copying it would have copied the
  // ''-is-a-CLEAR licence below, which is precisely the kind of subtlety that rots out
  // of sync between two copies.
  _rejectUnknownEnumeral(propName2, stringValue) {
    const prop2 = this._propFor(propName2);
    if (!prop2 || prop2.editor !== "select" || !prop2.readOptions) {
      return null;
    }
    if (stringValue === "") {
      return null;
    }
    const options = prop2.readOptions(this);
    if (options.length === 0 || options.indexOf(stringValue) >= 0) {
      return null;
    }
    const current = this[prop2.nodeProperty || prop2.key];
    return {
      error: true,
      reason: "There is no enumerated value named '" + stringValue + "'.",
      invalidValue: stringValue,
      validValue: typeof current === "string" ? current : ""
    };
  }
  // No structural editing by default. The classes that DO manage children (bus,
  // enum type, struct, MATLAB array/cell/string) override both, delegating to
  // childEdit.ts. Returning null here — rather than inheriting a wrapper around
  // no-op hooks — is what lets those hooks live only on the classes that mean them.
  execAddChild() {
    return null;
  }
  execRemoveChild(_child) {
    return null;
  }
  // A child of this node was renamed; keep any name-keyed serial in step. The
  // default is the field list a struct-shaped serial carries, which is all a
  // plain container needs. StructNode overrides it because a struct array shares
  // one field list across every element, so the rename has to reach the matching
  // child of each of them too.
  _renameField(from, to) {
    const fields = this.serial?._fields;
    if (!fields) {
      return;
    }
    const idx = fields.indexOf(from);
    if (idx >= 0) {
      fields[idx] = to;
    }
  }
  // An edit anywhere under an entry makes the entry Modified, and drops the raw parse
  // input of every node it passed THROUGH on the way up: `_rawInput` is the bytes a node
  // was read from, which a reserialize prefers over the live values, so a stale one is how
  // an edit reaches the table and never reaches the file.
  //
  // The walk is still here because only the walk sees those in-between nodes —
  // `owningEntry` reports the destination, not the path. It stops by comparing against
  // that destination rather than re-reading `isEntry`, so the two cannot come to disagree
  // about where the stretch ends (see owningEntryOf, which walks `parent` and nothing
  // else, which is what makes the comparison reachable at all).
  _markModified() {
    const entry = this.owningEntry;
    for (let node = this; node && node !== entry; node = node.parent) {
      if (node._rawInput !== void 0) {
        node._rawInput = void 0;
      }
    }
    if (entry) {
      entry.status = "Modified";
      if (entry._rawInput !== void 0) {
        entry._rawInput = void 0;
      }
      entry._stampLastModified();
    }
    this._markSourceDirty();
  }
  // Refresh the owning entry's last-modified timestamp to now. Called from
  // _markModified on the entry node so every edit (value, name, Min/Max/Unit,
  // schema props) updates the Last Modified column. The two parse paths carry
  // the timestamp under different keys; we update only the keys already present
  // so the JSON path stays byte-faithful (no injected keys) and the binary path
  // round-trips through its own scheme:
  //   text/JSON  — `lastmod` (raw); the getter formats it, JSON dumps it verbatim.
  //   binary     — `lastModifiedDate` (ISO, what the getter reads) + `_rawLastMod`
  //                (what serializeEntryToXml writes back).
  // Who modified it is not tracked (the extension has no user identity), so
  // lastModifiedBy/modifiedby is left as-is. No-op when the entry carries no
  // metadata bag (e.g. transient nodes).
  _stampLastModified() {
    const m = this.metadata;
    if (!m) {
      return;
    }
    const raw = matlabTimestampNow();
    if ("lastmod" in m) {
      m.lastmod = raw;
    }
    if ("_rawLastMod" in m) {
      m._rawLastMod = raw;
    }
    if ("lastModifiedDate" in m) {
      m.lastModifiedDate = formatMatlabTimestamp(raw);
    }
  }
  serialize() {
    if (this.isEntry) {
      return {
        name: this.name,
        metadata: this.metadata,
        value: this.serializeValue()
      };
    }
    return this.serializeValue();
  }
  /**
   * This node's rawVal with its live property bag written into the first element — the value
   * half of an entry in an uncompressed-text `.sldd`.
   *
   * The envelope is spelled out again on the way out. `_propsOf` lifted a text dictionary's
   * `_custom_save` into the bag under SAVEOBJ_KEY so everything between parse and save sees
   * one spelling; here it goes back to being an element-level `_custom_save`, because that is
   * where MATLAB's loadobj looks and a `_properties._saveobj` is a key MATLAB has no reader
   * for. The two are the same envelope — see XmlUtils' CUSTOM_SAVE_KEY.
   *
   * `_properties` is then OMITTED when the envelope was all it held, because that is what
   * MATLAB writes: a custom-saving class's element is `{_custom_save: …, _id: …}` with no
   * property bag at all, and emitting `"_properties": {}` beside the envelope would invent a
   * key no MATLAB-written dictionary has. A class with no envelope keeps its bag
   * unconditionally, empty or not — that path is unchanged.
   */
  _serializeSimulinkObject(propOverrides) {
    const props = this._mergeProps(propOverrides);
    const result = Object.assign({}, this.serial._rawVal);
    const rawElements = result._elements || [];
    const element2 = Object.assign({}, rawElements[0]);
    if (SAVEOBJ_KEY in props) {
      const siblings = Object.assign({}, props);
      delete siblings[SAVEOBJ_KEY];
      element2[CUSTOM_SAVE_KEY] = props[SAVEOBJ_KEY];
      if (Object.keys(siblings).length > 0) {
        element2._properties = siblings;
      } else {
        delete element2._properties;
      }
    } else {
      element2._properties = props;
    }
    result._elements = [element2];
    return result;
  }
  /**
   * The stored property bag with this node's live values written over it.
   *
   * The subtlety is the saveobj envelope. When a class serializes through `saveobj`,
   * MATLAB stores its whole state inside one unnamed `<P Source="saveobj">` and the
   * individual properties are NOT siblings of it — so a node that reads such a property
   * finds nothing, substitutes its own default (VariantVariableNode's
   * `(props.Specification as string) || ''`), and then writes that default back as a
   * sibling. cases.sldd's aVariant grew a `<P Name="Specification" Class="char"/>` next
   * to its envelope for exactly that reason: an empty string MATLAB had never written,
   * standing in for an empty 0x0 double it could not see.
   *
   * So under an envelope an EMPTY override is dropped: it is a default rather than an
   * edit, and the envelope is already the authority on that property.
   *
   * A non-empty override goes to BOTH places, and the reason it is both is defect 46.
   * The sibling used to be the only place it went, on the reasoning that silently
   * discarding a real edit is worse than writing a property MATLAB's loadobj *may*
   * ignore. The live gate settled the "may": MATLAB does ignore it. Editing a
   * VariantVariable's Specification to 'myNewVar' in a binary dictionary produced a file
   * MATLAB reopened with Specification '' — the edit was written, and written somewhere
   * nothing reads. Our own reader agreed with us because it reads the sibling too, which
   * is exactly the shape of failure this tier exists to catch: a value written wrongly
   * and read back with the same wrong assumption looks fine from inside.
   *
   * So the value is now also written INTO the envelope, which is what MATLAB actually
   * loads. The sibling is KEPT rather than replaced, because it is the only copy this
   * package's own reader can see — decoding the envelope back into node properties is
   * the other half of defect 40 and is not done here. Writing both keeps every consumer
   * correct and is strictly additive over the old behaviour.
   */
  _mergeProps(propOverrides) {
    const stored = Object.assign({}, this.serial._properties);
    if (!(SAVEOBJ_KEY in stored)) {
      return Object.assign(stored, propOverrides);
    }
    let envelope = stored[SAVEOBJ_KEY];
    for (const [key, val] of Object.entries(propOverrides)) {
      if (val === "" || val === null || val === void 0) {
        continue;
      }
      stored[key] = val;
      envelope = writeIntoSaveobj(envelope, key, val);
    }
    stored[SAVEOBJ_KEY] = envelope;
    return stored;
  }
  serializeValue() {
    return null;
  }
  serializeXml(tagName, attrs, indent) {
    if (this.serial && this.serial._rawVal && this.serial._rawVal._array_class) {
      return this._serializeSimulinkObjectXml(tagName, attrs, indent);
    }
    return pad(indent) + "<" + tagName + "/>";
  }
  _serializeSimulinkObjectXml(tagName, attrs, indent) {
    const p = pad(indent);
    const ip = pad(indent + 1);
    const rawVal = this.serial._rawVal;
    const className = rawVal._array_class;
    const props = this._getSerializedProperties();
    let attrStr = "";
    if (attrs && attrs.Name) {
      attrStr += ' Name="' + escapeXml(attrs.Name) + '"';
    }
    let xml = p + "<" + tagName + attrStr + ">\n";
    xml += ip + '<Element Class="' + escapeXml(className) + '">\n';
    for (const [propName2, propVal] of Object.entries(props)) {
      xml += _DataNode.serializePropertyXml(propName2, propVal, indent + 2, this) + "\n";
    }
    xml += ip + "</Element>\n";
    xml += p + "</" + tagName + ">";
    return xml;
  }
  _getSerializedProperties() {
    return Object.assign({}, this.serial._properties);
  }
  /**
   * The identifying attributes of a `<P>`.
   *
   * Almost always `Name="x"`. The exception is MATLAB's saveobj envelope, which a class
   * that serializes through `saveobj` uses to carry its whole state: MATLAB writes
   * `<P Source="saveobj" PropertyType="any" Class="struct">` with NO Name at all, and the
   * reader files it under SAVEOBJ_KEY because a property bag needs a key. Written back as
   * `Name="undefined"` — what an absent @_Name used to produce — MATLAB's loadobj finds
   * no envelope and builds an EMPTY object: cases.sldd's aVariant reopened as a
   * Simulink.VariantVariable with 0 choices where MATLAB wrote 2 (defect 28).
   *
   * Every `<P>` in this file goes through here, so the envelope survives whichever arm of
   * serializePropertyXml its payload takes.
   */
  static pxAttrs(name) {
    return name === SAVEOBJ_KEY ? ' Source="saveobj" PropertyType="any"' : ' Name="' + escapeXml(name) + '"';
  }
  static serializePropertyXml(name, value, indent, ownerNode) {
    const p = pad(indent);
    if (value === null || value === void 0) {
      return p + "<P" + _DataNode.pxAttrs(name) + ' Class="char"/>';
    }
    if (typeof value === "number") {
      return p + "<P" + _DataNode.pxAttrs(name) + ' Class="double">' + formatDoubleXml(value) + "</P>";
    }
    if (typeof value === "boolean") {
      return p + "<P" + _DataNode.pxAttrs(name) + ' Class="logical">' + (value ? "1" : "0") + "</P>";
    }
    if (typeof value === "string") {
      if (value === "") {
        return p + "<P" + _DataNode.pxAttrs(name) + ' Class="char"/>';
      }
      return p + "<P" + _DataNode.pxAttrs(name) + ' Class="char">' + escapeXml(value) + "</P>";
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return p + "<P" + _DataNode.pxAttrs(name) + ' Class="double" Dimension="0*0"/>';
      }
      if (value.every((v) => typeof v === "string")) {
        return _DataNode._serializeStringPropertyXml(name, value, [1, value.length], indent);
      }
      const formatted = value.map(function(v) {
        return formatDoubleXml(v);
      });
      return p + "<P" + _DataNode.pxAttrs(name) + ' Class="double" Dimension="1*' + value.length + '">' + formatted.join(" ") + "</P>";
    }
    if (typeof value === "object") {
      const obj = value;
      if (obj._type && obj._value !== void 0) {
        return _DataNode._serializeTypedPropertyXml(name, obj, indent);
      }
      if (obj._array_class) {
        return _DataNode._serializeObjectPropertyXml(name, obj, indent, ownerNode);
      }
      if (obj._object_class) {
        const wrapped = {
          _array_class: obj._object_class,
          _dimensions: [1, 1],
          _elements: [{ _properties: obj._properties || {} }]
        };
        return _DataNode._serializeObjectPropertyXml(name, wrapped, indent, ownerNode);
      }
      if (obj._array_type === "Struct") {
        return _DataNode._serializeStructPropertyXml(name, obj, indent);
      }
      if (obj._array_type === "Cell") {
        return _DataNode._serializeCellPropertyXml(name, obj, indent);
      }
      if (obj._array_type === "String") {
        const elements = obj._elements || [];
        return _DataNode._serializeStringPropertyXml(name, elements, obj._dimensions || [1, elements.length], indent);
      }
    }
    return p + "<P" + _DataNode.pxAttrs(name) + ' Class="char">' + escapeXml(String(value)) + "</P>";
  }
  /**
   * The `Class="char" Dimension="r*c"` attributes and body of an mxchar literal, or
   * null for anything else — shared by the property and cell-element writers below.
   *
   * mxchar is MATLAB's TEXT-dictionary spelling of a shaped char (character codes, one
   * bracketed group per row); XML wants the plain column-major text under a Dimension
   * (defect 25). Written through the generic typed-value path instead, a char field of
   * a struct went out as `Class="mxchar" Dimension="2*2">97 99 98 100` — a class MATLAB
   * does not have, holding numbers where its characters were.
   */
  static _mxCharXml(value) {
    if (value._type !== "mxchar") {
      return null;
    }
    const m = String(value._value).match(/^Matrix\((\d+(?:,\d+)*)\)\n(.+)$/s);
    if (!m) {
      return { dimAttr: "", body: escapeXml(String(value._value)) };
    }
    const dims = m[1].split(",").map(function(s) {
      return parseInt(s, 10);
    });
    return {
      dimAttr: ' Dimension="' + dims.join("*") + '"',
      // Number() rather than a cast: _parseMatrixNums is typed for the 64-bit case now,
      // and a char code is never one — mxchar is not an integer class.
      body: escapeXml(charTextFromCodes(_DataNode._parseMatrixNums(m[2]).map(Number), dims))
    };
  }
  /**
   * MATLAB's spelling of a string value, from the `<Element Class="string">` down: a
   * saveobj CELL of chars, one `<Element Class="char">` per element, carrying the cell's
   * Dimension for every shape but 1x1.
   *
   * Copied from the string entries of the MATLAB-authored dictionaries in
   * test/parity/artifacts/binary — `strScalar` writes an undimensioned cell around one
   * char, `strArray` a `Dimension="1*3"` one around three. Those are dictionary ENTRIES
   * rather than object properties, and the corpus has no MATLAB-authored object holding a
   * string, but BinarySlddParser decodes both through the same parseStringValue, so there
   * is one envelope to write and not two.
   *
   * Shared with MatlabVariableNode._serializeStringXml, which writes the same envelope
   * for an entry, for the same reason _mxCharXml is shared: this is the second and last
   * place that spells it, and two copies of a format are how one of them goes stale.
   */
  static _stringEnvelopeXml(elements, dims, indent) {
    const ip = pad(indent + 1);
    const ip2 = pad(indent + 2);
    const ip3 = pad(indent + 3);
    const dimAttr = dims.length <= 2 && dims[0] === 1 && dims[1] === 1 ? "" : ' Dimension="' + dims.join("*") + '"';
    let xml = ip + '<Element Class="string">\n';
    xml += ip2 + '<P Source="saveobj" PropertyType="any" Class="cell"' + dimAttr + ">\n";
    for (const el of elements) {
      xml += ip3 + '<Element Class="char">' + escapeXml(el || "") + "</Element>\n";
    }
    xml += ip2 + "</P>\n";
    xml += ip + "</Element>\n";
    return xml;
  }
  // A string-valued PROPERTY: the envelope above under a `<P Name="…">` that carries no
  // Class of its own — the class is stated by the Element inside, exactly as MATLAB
  // writes it and as _serializeObjectPropertyXml's `<P>` does for a nested object.
  static _serializeStringPropertyXml(name, elements, dims, indent) {
    const p = pad(indent);
    return p + "<P" + _DataNode.pxAttrs(name) + ">\n" + _DataNode._stringEnvelopeXml(elements, dims, indent) + p + "</P>";
  }
  static _serializeTypedPropertyXml(name, value, indent) {
    const p = pad(indent);
    const type = value._type;
    const raw = String(value._value);
    const mxChar = _DataNode._mxCharXml(value);
    if (mxChar) {
      return p + "<P" + _DataNode.pxAttrs(name) + ' Class="char"' + mxChar.dimAttr + ">" + mxChar.body + "</P>";
    }
    if (type === "cdata") {
      if (isMatCdata(value)) {
        return NodeRegistry_default.parseValue(value, name, null).serializeXml("P", { Name: name }, indent);
      }
      const formatted = formatComplexXml(raw);
      return p + "<P" + _DataNode.pxAttrs(name) + ' Class="double" IsComplex="1">' + formatted + "</P>";
    }
    const matrixMatch = raw.match(/^Matrix\((\d+(?:,\d+)*)\)\n(.+)$/s);
    if (matrixMatch) {
      const dims = matrixMatch[1].split(",").map(function(s) {
        return parseInt(s, 10);
      });
      const nums = _DataNode._parseMatrixNums(matrixMatch[2], type);
      const colMajor = transposeToColumnMajorND(nums, dims);
      const formatted = colMajor.map(function(v) {
        return formatNumericXml(v, type);
      });
      return p + "<P" + _DataNode.pxAttrs(name) + ' Class="' + type + '" Dimension="' + dims.join("*") + '">' + formatted.join(" ") + "</P>";
    }
    const vecMatch = raw.match(/^\[(.+)\]$/);
    if (vecMatch) {
      const parts = vecMatch[1].split(",").map(function(s) {
        return _DataNode._numToken(s, type);
      });
      const formatted = parts.map(function(v) {
        return formatNumericXml(v, type);
      });
      return p + "<P" + _DataNode.pxAttrs(name) + ' Class="' + type + '" Dimension="1*' + parts.length + '">' + formatted.join(" ") + "</P>";
    }
    const num = _DataNode._numToken(raw, type);
    return p + "<P" + _DataNode.pxAttrs(name) + ' Class="' + type + '">' + formatNumericXml(num, type) + "</P>";
  }
  static _serializeObjectPropertyXml(name, value, indent, ownerNode) {
    const p = pad(indent);
    const ip = pad(indent + 1);
    const className = value._array_class;
    const dims = value._dimensions || [1, 1];
    const elements = value._elements || [];
    if (elements.length === 0 || elements.length === 1 && (!elements[0]._properties || Object.keys(elements[0]._properties).length === 0)) {
      return p + "<P" + _DataNode.pxAttrs(name) + ">\n" + ip + '<Element Class="' + escapeXml(className) + '"/>\n' + p + "</P>";
    }
    const dimAttr = dims.length <= 2 && dims[0] === 1 && dims[1] === 1 && elements.length === 1 ? "" : ' Dimension="' + dims.join("*") + '"';
    let xml = p + "<P" + _DataNode.pxAttrs(name) + dimAttr + ">\n";
    for (const elem of elements) {
      const props = elem._properties || {};
      xml += ip + '<Element Class="' + escapeXml(className) + '">\n';
      for (const [propName2, propVal] of Object.entries(props)) {
        xml += _DataNode.serializePropertyXml(propName2, propVal, indent + 2, ownerNode) + "\n";
      }
      xml += ip + "</Element>\n";
    }
    xml += p + "</P>";
    return xml;
  }
  static _serializeStructPropertyXml(name, value, indent) {
    const p = pad(indent);
    const ip = pad(indent + 1);
    const dims = value._dimensions || [1, 1];
    const elements = value._elements || [];
    const dimAttr = dims.length <= 2 && dims[0] === 1 && dims[1] === 1 ? "" : ' Dimension="' + dims.join("*") + '"';
    let xml = p + "<P" + _DataNode.pxAttrs(name) + ' Class="struct"' + dimAttr + ">\n";
    if (elements.length === 0) {
      for (const field of value._fields || []) {
        xml += ip + '<Field Name="' + escapeXml(field) + '"/>\n';
      }
    }
    for (const elem of elements) {
      xml += ip + "<Element>\n";
      for (const [field, fieldVal] of Object.entries(elem)) {
        xml += _DataNode.serializePropertyXml(field, fieldVal, indent + 2, null) + "\n";
      }
      xml += ip + "</Element>\n";
    }
    xml += p + "</P>";
    return xml;
  }
  static _serializeCellPropertyXml(name, value, indent) {
    const p = pad(indent);
    const dims = value._dimensions || [1, 1];
    const elements = value._elements || [];
    let xml = p + "<P" + _DataNode.pxAttrs(name) + ' Class="cell" Dimension="' + dims.join("*") + '">\n';
    for (const elem of elements) {
      xml += _DataNode._serializeCellElementXml(elem, indent + 1) + "\n";
    }
    xml += p + "</P>";
    return xml;
  }
  static _serializeCellElementXml(elem, indent) {
    const p = pad(indent);
    if (typeof elem === "number") {
      return p + '<Element Class="double">' + formatDoubleXml(elem) + "</Element>";
    }
    if (typeof elem === "boolean") {
      return p + '<Element Class="logical">' + (elem ? "1" : "0") + "</Element>";
    }
    if (typeof elem === "string") {
      return p + '<Element Class="char">' + escapeXml(elem) + "</Element>";
    }
    if (Array.isArray(elem)) {
      if (elem.length === 0) {
        return p + '<Element Class="double" Dimension="0*0"/>';
      }
      const formatted = elem.map(function(v) {
        return formatDoubleXml(v);
      });
      return p + '<Element Class="double" Dimension="1*' + elem.length + '">' + formatted.join(" ") + "</Element>";
    }
    if (typeof elem === "object" && elem !== null && elem._type) {
      const obj = elem;
      const type = obj._type;
      const raw = String(obj._value);
      const mxChar = _DataNode._mxCharXml(obj);
      if (mxChar) {
        return p + '<Element Class="char"' + mxChar.dimAttr + ">" + mxChar.body + "</Element>";
      }
      const vecMatch = raw.match(/^\[(.+)\]$/);
      if (vecMatch) {
        const parts = vecMatch[1].split(",").map(function(s) {
          return _DataNode._numToken(s, type);
        });
        return p + '<Element Class="' + type + '" Dimension="1*' + parts.length + '">' + parts.map(function(v) {
          return formatNumericXml(v, type);
        }).join(" ") + "</Element>";
      }
      const num = _DataNode._numToken(raw, type);
      return p + '<Element Class="' + type + '">' + formatNumericXml(num, type) + "</Element>";
    }
    return p + '<Element Class="char">' + escapeXml(String(elem)) + "</Element>";
  }
  /**
   * One number out of a typed literal: '3.14159274F', '18446744073709551615U', '-1'.
   *
   * A 64-bit integer comes back as exact decimal TEXT rather than a number, because
   * every value MATLAB's int64/uint64 range holds past 2^53 is one a double does not
   * (XmlUtils.parseExactNum). This routine is the single re-parse point of the XML write
   * path, and it used to be `parseMatlabNum` at four separate call sites: a uint64 read
   * losslessly by BinarySlddParser was still rounded here, one step before the file, so
   * maxU64 went out as 18446744073709552000U — a token now OUT of uint64 range, at which
   * MATLAB's reader abandons the rest of the body and zeroes the value's remaining
   * elements (defects 29 and 30).
   */
  static _numToken(text, type) {
    const bare = text.replace(/[FU]$/, "");
    return needsExactInt(type) ? parseExactNum(bare) : parseMatlabNum(bare);
  }
  // Flatten the body of a Matrix(r,c) literal to row-major numbers. Rows are
  // separated by ';' or by a newline depending on which writer produced the
  // literal — BinarySlddParser joins with '; ', while MatlabVariableNode,
  // McosParser, and ParameterNode join with '\n'. Splitting on only one of the
  // two silently merges every row into one, dropping an element per row break
  // and shifting the rest, so both have to be accepted here.
  //
  // `type` selects the exactness of each token (_numToken); it defaults to double, so
  // the char-code caller — whose codes are all far inside a double — reads plain numbers.
  static _parseMatrixNums(body, type = "double") {
    const cleaned = body.replace(/^\[/, "").replace(/\]$/, "");
    const nums = [];
    for (const row of cleaned.split(/[;\n]/)) {
      const inner = row.trim().replace(/^\[/, "").replace(/\]$/, "");
      if (inner === "") {
        continue;
      }
      for (const part of inner.split(",")) {
        nums.push(_DataNode._numToken(part, type));
      }
    }
    return nums;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/childEdit.js
function notifyParent(node) {
  node.parent?.childStructureChanged(node);
}
function addChildUndoable(node) {
  if (!node.canAddChild()) {
    return null;
  }
  const child = node.addChildNode();
  if (!child) {
    return null;
  }
  const index = node.children.indexOf(child);
  notifyParent(node);
  return {
    node: child,
    undo: () => {
      node.removeChildNode(child);
      notifyParent(node);
    },
    redo: () => {
      node.restoreChildNode(child, index);
      notifyParent(node);
    }
  };
}
function removeChildUndoable(node, child) {
  if (!node.canRemoveChild() || !child) {
    return null;
  }
  const index = node.children.indexOf(child);
  if (index < 0) {
    return null;
  }
  node.removeChildNode(child);
  notifyParent(node);
  return {
    undo: () => {
      node.restoreChildNode(child, index);
      notifyParent(node);
    },
    redo: () => {
      node.removeChildNode(child);
      notifyParent(node);
    }
  };
}

// node_modules/data-explorer-core/dist/datamodel/node/icons.js
var OBJECT_ICON = "ws3d";

// node_modules/fflate/esm/index.mjs
import { createRequire } from "module";
var require2 = createRequire("/");
var _a;
var Worker;
var isMarkedAsUntransferable;
try {
  _a = require2("worker_threads"), Worker = _a.Worker, isMarkedAsUntransferable = _a.isMarkedAsUntransferable;
} catch (e) {
}
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i = 0; i < d.length; ++i) {
    if (d[i])
      t.push({ s: i, f: d[i] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et, l: 0 };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return { t: v, l: 1 };
  }
  t.sort(function(a, b) {
    return a.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
  t[0] = { s: -1, f: l.f + r.f, l, r };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i2].f ? i0++ : i2++];
    r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
    t[i1++] = { s: -1, f: l.f + r.f, l, r };
  }
  var maxSym = t2[0].s;
  for (var i = 1; i < s; ++i) {
    if (t2[i].s > maxSym)
      maxSym = t2[i].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; i < s; ++i) {
      var i2_1 = t2[i].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i;
    }
    for (; i >= 0 && dt; --i) {
      var i2_3 = t2[i].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c) {
  var s = c.length;
  while (s && !c[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c[0], cls = 1;
  var w = function(v) {
    cl[cli++] = v;
  };
  for (var i = 1; i <= s; ++i) {
    if (c[i] == cln && i != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6)
          w(8304);
        if (cls > 2)
          w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w(cln);
      cls = 1;
      cln = c[i];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i = 0; i < cl.length; ++i)
    l += cf[i] * cl[i];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    out[o + i + 4] = dat[i];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i = 0; i < lclt.length; ++i)
    ++lcfreq[lclt[i] & 31];
  for (var i = 0; i < lcdt.length; ++i)
    ++lcfreq[lcdt[i] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i = 0; i < nlcc; ++i)
      wbits(out, p + 3 * i, lct[clim[i]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i = 0; i < clct.length; ++i) {
        var len = clct[i] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i] >> 5 & 127), p += clct[i] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i = 0; i < li; ++i) {
    var sym = syms[i];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i2) {
      return (dat[i2] ^ dat[i2 + 1] << bs1_1 ^ dat[i2 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i + 2 < s; ++i) {
      var hv = hsh(i);
      var imod = i & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i) {
        var rem = s - i;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
          li = lc_1 = eb = 0, bs = i;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i + l] == dat[i + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i - dif + j & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i];
          ++lf[dat[i]];
        }
      }
    }
    for (i = Math.max(i, wi); i < s; ++i) {
      syms[li++] = dat[i];
      ++lf[dat[i]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i, st.w = wi;
    }
  } else {
    for (var i = st.w || 0; i < s + lst; i += 65535) {
      var e = i + 65535;
      if (e >= s) {
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(i, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ (function() {
  var t = new Int32Array(256);
  for (var i = 0; i < 256; ++i) {
    var c = i, k = 9;
    while (--k)
      c = (c & 1 && -306674912) ^ c >>> 1;
    t[i] = c;
  }
  return t;
})();
var crc = function() {
  var c = -1;
  return {
    p: function(d) {
      var cr = c;
      for (var i = 0; i < d.length; ++i)
        cr = crct[cr & 255 ^ d[i]] ^ cr >>> 8;
      c = cr;
    },
    d: function() {
      return ~c;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
var wbytes = function(d, b, v) {
  for (; v; ++b)
    d[b] = v, v >>>= 8;
};
var zls = function(d, dict) {
  if ((d[0] & 15) != 8 || d[0] >> 4 > 7 || (d[0] << 8 | d[1]) % 31)
    err(6, "invalid zlib data");
  if ((d[1] >> 5 & 1) == +!dict)
    err(6, "invalid zlib data: " + (d[1] & 32 ? "need" : "unexpected") + " dictionary");
  return (d[1] >> 3 & 4) + 2;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
function unzlibSync(data, opts) {
  return inflt(data.subarray(zls(data, opts && opts.dictionary), -4), { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var fltn = function(d, p, t, o) {
  for (var k in d) {
    var val = d[k], n = p + k, op = o;
    if (Array.isArray(val))
      op = mrg(o, val[1]), val = val[0];
    if (ArrayBuffer.isView(val))
      t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
};
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i = 0; i < str.length; ++i)
      ar_1[i] = str.charCodeAt(i);
    return ar_1;
  }
  if (te)
    return te.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w = function(v) {
    ar[ai++] = v;
  };
  for (var i = 0; i < l; ++i) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i << 1));
      n.set(ar);
      ar = n;
    }
    var c = str.charCodeAt(i);
    if (c < 128 || latin1)
      w(c);
    else if (c < 2048)
      w(192 | c >> 6), w(128 | c & 63);
    else if (c > 55295 && c < 57344)
      c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
    else
      w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
  }
  return slc(ar, 0, ai);
}
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
var exfl = function(ex) {
  var le = 0;
  if (ex) {
    for (var k in ex) {
      var l = ex[k].length;
      if (l > 65535)
        err(9);
      le += l + 4;
    }
  }
  return le;
};
var wzh = function(d, b, f, fn, u, c, ce, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
  if (ce != null)
    d[b++] = 20, d[b++] = f.os;
  d[b] = 20, b += 2;
  d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
  if (y < 0 || y > 119)
    err(10);
  wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
  if (c != -1) {
    wbytes(d, b, f.crc);
    wbytes(d, b + 4, c < 0 ? -c - 2 : c);
    wbytes(d, b + 8, f.size);
  }
  wbytes(d, b + 12, fl2);
  wbytes(d, b + 14, exl), b += 16;
  if (ce != null) {
    wbytes(d, b, col);
    wbytes(d, b + 6, f.attrs);
    wbytes(d, b + 10, ce), b += 14;
  }
  d.set(fn, b);
  b += fl2;
  if (exl) {
    for (var k in ex) {
      var exf = ex[k], l = exf.length;
      wbytes(d, b, +k);
      wbytes(d, b + 2, l);
      d.set(exf, b + 4), b += 4 + l;
    }
  }
  if (col)
    d.set(co, b), b += col;
  return b;
};
var wzf = function(o, b, c, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c);
  wbytes(o, b + 10, c);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
};
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p = _a2[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
    var exl = exfl(p.extra);
    if (s > 65535)
      err(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c = crc();
    c.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c.d(),
      c: d,
      f,
      m,
      u: s != fn.length || m && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe = o, cdl = tot - o;
  for (var i = 0; i < files.length; ++i) {
    var f = files[i];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe);
  return out;
}
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = b4(data, e - 20) == 117853008;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i = 0; i < c; ++i) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// node_modules/data-explorer-core/dist/datamodel/parser/Inflate.js
var override;
var detected;
function activeNative() {
  if (override !== void 0)
    return override;
  if (detected === void 0)
    detected = detectNative();
  return detected;
}
function detectNative() {
  const proc = globalThis.process;
  const getBuiltinModule = proc?.getBuiltinModule;
  if (typeof getBuiltinModule !== "function")
    return null;
  let mod;
  try {
    mod = getBuiltinModule.call(proc, "node:zlib");
  } catch {
    return null;
  }
  const zlib = mod;
  if (typeof zlib?.inflateRawSync !== "function" || typeof zlib?.inflateSync !== "function") {
    return null;
  }
  const inflateSync2 = zlib.inflateSync;
  const syncFlush = zlib.constants?.Z_SYNC_FLUSH;
  return {
    raw: zlib.inflateRawSync,
    zlib: inflateSync2,
    zlibHead: typeof syncFlush === "number" ? (prefix) => inflateSync2(prefix, { finishFlush: syncFlush }) : void 0
  };
}
function ownExactBuffer(b) {
  if (b.byteOffset === 0 && b.buffer.byteLength === b.byteLength) {
    return b.constructor === Uint8Array ? b : new Uint8Array(b.buffer, 0, b.byteLength);
  }
  return new Uint8Array(b);
}
var SIG_EOCD = 101010256;
var SIG_ZIP64_LOCATOR = 117853008;
var SIG_CENTRAL = 33639248;
var SIG_LOCAL = 67324752;
var UnsupportedArchive = class extends Error {
};
function unzipEntries(bytes, wanted) {
  const native = activeNative();
  if (native === null)
    return unzipWithFflate(bytes, wanted);
  try {
    return walkCentralDirectory(bytes, native, wanted);
  } catch {
    return unzipWithFflate(bytes, wanted);
  }
}
function unzipWithFflate(bytes, wanted) {
  if (wanted === void 0)
    return unzipSync(bytes);
  return unzipSync(bytes, { filter: (file) => wanted(file.name) });
}
function walkCentralDirectory(bytes, native, wanted) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEndOfCentralDirectory(view);
  if (eocd >= 20 && view.getUint32(eocd - 20, true) === SIG_ZIP64_LOCATOR) {
    throw new UnsupportedArchive("zip64");
  }
  if (view.getUint16(eocd + 4, true) !== 0 || view.getUint16(eocd + 6, true) !== 0) {
    throw new UnsupportedArchive("multi-disk");
  }
  const count = view.getUint16(eocd + 10, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  if (count === 65535 || centralOffset === 4294967295)
    throw new UnsupportedArchive("zip64 sentinel");
  const out = {};
  let p = centralOffset;
  for (let i = 0; i < count; i++) {
    if (p + 46 > view.byteLength)
      throw new UnsupportedArchive("central directory truncated");
    if (view.getUint32(p, true) !== SIG_CENTRAL)
      throw new UnsupportedArchive("central directory signature");
    const flags = view.getUint16(p + 8, true);
    const method = view.getUint16(p + 10, true);
    const compressedSize = view.getUint32(p + 20, true);
    const uncompressedSize = view.getUint32(p + 24, true);
    const nameLength = view.getUint16(p + 28, true);
    const extraLength = view.getUint16(p + 30, true);
    const commentLength = view.getUint16(p + 32, true);
    const localOffset = view.getUint32(p + 42, true);
    if (flags & 1)
      throw new UnsupportedArchive("encrypted entry");
    if (compressedSize === 4294967295 || uncompressedSize === 4294967295) {
      throw new UnsupportedArchive("zip64 entry size");
    }
    const name = utf8.decode(bytes.subarray(p + 46, p + 46 + nameLength));
    if (view.getUint32(localOffset, true) !== SIG_LOCAL) {
      throw new UnsupportedArchive("local header signature");
    }
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataAt = localOffset + 30 + localNameLength + localExtraLength;
    if (dataAt + compressedSize > view.byteLength)
      throw new UnsupportedArchive("entry data truncated");
    const keep = wanted === void 0 || wanted(name);
    const raw = bytes.subarray(dataAt, dataAt + compressedSize);
    if (method === 0) {
      if (keep)
        out[name] = raw.slice();
    } else if (method === 8) {
      if (keep) {
        const inflated = ownExactBuffer(native.raw(raw));
        if (inflated.byteLength !== uncompressedSize) {
          throw new UnsupportedArchive("inflated size disagrees with the directory");
        }
        out[name] = inflated;
      }
    } else {
      throw new UnsupportedArchive(`compression method ${method}`);
    }
    p += 46 + nameLength + extraLength + commentLength;
  }
  return out;
}
function findEndOfCentralDirectory(view) {
  const limit = Math.max(0, view.byteLength - 65557);
  for (let i = view.byteLength - 22; i >= limit; i--) {
    if (view.getUint32(i, true) === SIG_EOCD)
      return i;
  }
  throw new UnsupportedArchive("no end-of-central-directory record");
}
var utf8 = new TextDecoder();
function inflateZlib(wrapped) {
  const native = activeNative();
  if (native === null)
    return unzlibSync(wrapped);
  try {
    return ownExactBuffer(native.zlib(wrapped));
  } catch {
    return unzlibSync(wrapped);
  }
}

// node_modules/data-explorer-core/dist/datamodel/parser/ParseWarning.js
function reasonOf(err2) {
  if (err2 instanceof Error) {
    return err2.message;
  }
  return String(err2);
}

// node_modules/data-explorer-core/dist/datamodel/parser/MatParser.js
var CLASS_NAMES = {
  1: "cell",
  2: "struct",
  3: "object",
  4: "char",
  5: "sparse",
  6: "double",
  7: "single",
  8: "int8",
  9: "uint8",
  10: "int16",
  11: "uint16",
  12: "int32",
  13: "uint32",
  14: "int64",
  15: "uint64"
};
var MI_INT8 = 1;
var MI_UINT8 = 2;
var MI_INT16 = 3;
var MI_UINT16 = 4;
var MI_INT32 = 5;
var MI_UINT32 = 6;
var MI_SINGLE = 7;
var MI_DOUBLE = 9;
var MI_INT64 = 12;
var MI_UINT64 = 13;
var MI_MATRIX = 14;
var MI_COMPRESSED = 15;
var MI_UTF8 = 16;
var MI_UTF16 = 17;
function align8(n) {
  return n + (8 - n % 8) % 8;
}
function readSubelement(view, offset) {
  if (offset < 0 || offset + 8 > view.byteLength) {
    return { type: 0, bytes: 0, dataOffset: Math.max(0, Math.min(offset, view.byteLength)), totalSize: 8 };
  }
  const tag = view.getUint32(offset, true);
  const hi = tag >>> 16 & 65535;
  const lo = tag & 65535;
  if (hi !== 0 && lo !== 0) {
    return { type: lo, bytes: Math.min(hi, 4), dataOffset: offset + 4, totalSize: 8 };
  }
  const type = view.getUint32(offset, true);
  const declared = view.getUint32(offset + 4, true);
  const bytes = Math.min(declared, Math.max(0, view.byteLength - (offset + 8)));
  return { type, bytes, dataOffset: offset + 8, totalSize: 8 + align8(bytes) };
}
var ELEMENT_WIDTH = {
  [MI_INT8]: 1,
  [MI_UINT8]: 1,
  [MI_INT16]: 2,
  [MI_UINT16]: 2,
  [MI_INT32]: 4,
  [MI_UINT32]: 4,
  [MI_SINGLE]: 4,
  [MI_DOUBLE]: 8,
  [MI_INT64]: 8,
  [MI_UINT64]: 8
};
function readNumericArray(view, sub, count) {
  const values = [];
  const off = sub.dataOffset;
  const width = ELEMENT_WIDTH[sub.type];
  if (width) {
    const available = Math.min(sub.bytes, Math.max(0, view.byteLength - off));
    count = Math.min(count, Math.floor(available / width));
  }
  for (let i = 0; i < count; i++) {
    switch (sub.type) {
      case MI_DOUBLE:
        values.push(view.getFloat64(off + i * 8, true));
        break;
      case MI_SINGLE:
        values.push(view.getFloat32(off + i * 4, true));
        break;
      case MI_INT8:
        values.push(view.getInt8(off + i));
        break;
      case MI_UINT8:
        values.push(view.getUint8(off + i));
        break;
      case MI_INT16:
        values.push(view.getInt16(off + i * 2, true));
        break;
      case MI_UINT16:
        values.push(view.getUint16(off + i * 2, true));
        break;
      case MI_INT32:
        values.push(view.getInt32(off + i * 4, true));
        break;
      case MI_UINT32:
        values.push(view.getUint32(off + i * 4, true));
        break;
      case MI_INT64:
        values.push(exactInt(view.getBigInt64(off + i * 8, true)));
        break;
      case MI_UINT64:
        values.push(exactInt(view.getBigUint64(off + i * 8, true)));
        break;
      default:
        values.push(0);
    }
  }
  return values;
}
function readString(view, sub) {
  const bytes = new Uint8Array(view.buffer, view.byteOffset + sub.dataOffset, sub.bytes);
  return new TextDecoder().decode(bytes).replace(/\0/g, "");
}
function transposeFromColMajor(values, dimensions) {
  if (values.length <= 1) {
    return values;
  }
  const rows = dimensions[0];
  const cols = dimensions[1];
  if (rows <= 1 || cols <= 1) {
    return values;
  }
  const page = rows * cols;
  const result = values.slice();
  for (let base = 0; base + page <= values.length; base += page) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result[base + r * cols + c] = values[base + c * rows + r];
      }
    }
  }
  return result;
}
function undecodedValue(dimensions, className) {
  const shape = dimensions.length >= 2 ? dimensions : [1, dimensions[0] || 1];
  return "<" + shape.join("x") + " " + className + ", not decoded>";
}
var SPARSE_MAX_DENSE_ELEMENTS = 1e6;
function readSparse(view, offset, end, dimensions, isComplex, nzmax) {
  const rows = Math.max(0, dimensions[0] || 0);
  const cols = Math.max(0, dimensions[1] || 0);
  let ir = [];
  if (offset < end) {
    const irSub = readSubelement(view, offset);
    offset += irSub.totalSize;
    const irCount = Math.floor(irSub.bytes / 4);
    ir = readNumericArray(view, irSub, nzmax > 0 ? Math.min(nzmax, irCount) : irCount).map(Number);
  }
  let jc = [];
  if (offset < end) {
    const jcSub = readSubelement(view, offset);
    offset += jcSub.totalSize;
    jc = readNumericArray(view, jcSub, cols + 1).map(Number);
  }
  const nnz = Math.max(0, Math.min(jc.length === cols + 1 ? jc[cols] : ir.length, ir.length));
  let pr = [];
  if (offset < end) {
    const prSub = readSubelement(view, offset);
    offset += prSub.totalSize;
    pr = readNumericArray(view, prSub, nnz);
  }
  let pi = [];
  if (isComplex && offset < end) {
    const piSub = readSubelement(view, offset);
    offset += piSub.totalSize;
    pi = readNumericArray(view, piSub, nnz);
  }
  const total = rows * cols;
  const dense = new Array(total);
  for (let i = 0; i < total; i++) {
    dense[i] = isComplex ? { re: 0, im: 0 } : 0;
  }
  for (let col = 0; col < cols; col++) {
    const from = Math.max(0, jc[col] ?? 0);
    const to = Math.min(jc[col + 1] ?? from, nnz);
    for (let k = from; k < to; k++) {
      const row = ir[k];
      if (!(row >= 0 && row < rows)) {
        continue;
      }
      dense[row * cols + col] = isComplex ? { re: pr[k] ?? 0, im: pi[k] ?? 0 } : pr[k] ?? 0;
    }
  }
  return dense;
}
function parseOpaque(view, offset, _end) {
  const nameSub = readSubelement(view, offset);
  offset += nameSub.totalSize;
  const name = readString(view, nameSub);
  const markerSub = readSubelement(view, offset);
  offset += markerSub.totalSize;
  const classSub = readSubelement(view, offset);
  const className = readString(view, classSub);
  return { name, className, dimensions: [1, 1], isComplex: false, isLogical: false, value: null, fields: null, isOpaque: true };
}
function parseMatrix(view, baseOffset, length) {
  let offset = baseOffset;
  const end = baseOffset + length;
  const flagsSub = readSubelement(view, offset);
  offset += flagsSub.totalSize;
  if (flagsSub.bytes < 2) {
    return { name: "", className: "unknown", dimensions: [], isComplex: false, isLogical: false, value: null, fields: null };
  }
  const arrayClass = view.getUint8(flagsSub.dataOffset) & 255;
  const flags = view.getUint8(flagsSub.dataOffset + 1);
  const isComplex = !!(flags & 8);
  const isLogical = !!(flags & 2);
  if (arrayClass === 17) {
    return parseOpaque(view, offset, end);
  }
  const dimsSub = readSubelement(view, offset);
  offset += dimsSub.totalSize;
  const ndims = Math.floor(dimsSub.bytes / 4);
  const dimensions = [];
  for (let i = 0; i < ndims; i++) {
    dimensions.push(view.getInt32(dimsSub.dataOffset + i * 4, true));
  }
  const nameSub = readSubelement(view, offset);
  offset += nameSub.totalSize;
  const nameBytes = new Uint8Array(view.buffer, view.byteOffset + nameSub.dataOffset, nameSub.bytes);
  const name = new TextDecoder().decode(nameBytes);
  const totalElements = dimensions.reduce((a, b) => a * b, 1);
  const className = CLASS_NAMES[arrayClass] || "unknown";
  const result = { name, className, dimensions, isComplex, isLogical, value: null, fields: null };
  if (arrayClass >= 6 && arrayClass <= 15) {
    if (offset < end) {
      const realSub = readSubelement(view, offset);
      offset += realSub.totalSize;
      const realValues = readNumericArray(view, realSub, totalElements);
      if (isComplex && offset < end) {
        const imagSub = readSubelement(view, offset);
        offset += imagSub.totalSize;
        const imagValues = readNumericArray(view, imagSub, totalElements);
        const colMajor = realValues.map((r, i) => ({ re: r, im: imagValues[i] }));
        result.value = transposeFromColMajor(colMajor, dimensions);
      } else {
        const rowMajor = transposeFromColMajor(realValues, dimensions);
        result.value = rowMajor.length === 1 ? rowMajor[0] : rowMajor;
      }
    }
  } else if (arrayClass === 5) {
    const nzmax = flagsSub.bytes >= 8 ? view.getUint32(flagsSub.dataOffset + 4, true) : 0;
    if (totalElements > SPARSE_MAX_DENSE_ELEMENTS) {
      result.value = undecodedValue(dimensions, className);
      result.undecoded = "sparse array of " + totalElements + " elements: larger than this reader materializes (" + SPARSE_MAX_DENSE_ELEMENTS + " elements), and its non-zeros are not read";
    } else if (offset < end) {
      const dense = readSparse(view, offset, end, dimensions, isComplex, nzmax);
      result.value = isComplex ? dense : dense.length === 1 ? dense[0] : dense;
    }
  } else if (arrayClass === 3) {
    result.value = undecodedValue(dimensions, className);
    result.undecoded = "MAT array class 3, the pre-MCOS object: recorded but not decoded, because no MATLAB-authored fixture in this corpus pins its layout";
  } else if (arrayClass === 4) {
    if (offset < end) {
      const charSub = readSubelement(view, offset);
      offset += charSub.totalSize;
      const charBytes = new Uint8Array(view.buffer, view.byteOffset + charSub.dataOffset, charSub.bytes);
      if (charSub.type === MI_UTF8 || charSub.type === MI_UINT8 || charSub.type === MI_INT8) {
        result.value = new TextDecoder().decode(charBytes);
      } else if (charSub.type === MI_UTF16 || charSub.type === MI_UINT16) {
        result.value = new TextDecoder("utf-16le").decode(charBytes);
      } else {
        result.value = new TextDecoder().decode(charBytes);
      }
    }
  } else if (arrayClass === 2) {
    if (offset < end) {
      const fieldNameLenSub = readSubelement(view, offset);
      offset += fieldNameLenSub.totalSize;
      const fieldNameLen = fieldNameLenSub.bytes >= 4 ? view.getInt32(fieldNameLenSub.dataOffset, true) : 0;
      if (fieldNameLen <= 0) {
        result.fields = {};
        return result;
      }
      const fieldNamesSub = readSubelement(view, offset);
      offset += fieldNamesSub.totalSize;
      const fieldNames = [];
      const fnBytes = new Uint8Array(view.buffer, view.byteOffset + fieldNamesSub.dataOffset, fieldNamesSub.bytes);
      for (let i = 0; i < fnBytes.length; i += fieldNameLen) {
        let str = "";
        for (let j = i; j < i + fieldNameLen && fnBytes[j] !== 0; j++) {
          str += String.fromCharCode(fnBytes[j]);
        }
        if (str) {
          fieldNames.push(str);
        }
      }
      const fields = {};
      for (let e = 0; e < totalElements; e++) {
        for (const fn of fieldNames) {
          if (offset >= end) {
            break;
          }
          const fieldStart = offset;
          const fieldMatrixSub = readSubelement(view, offset);
          if (fieldMatrixSub.type === MI_MATRIX) {
            const child = parseMatrix(view, offset + 8, fieldMatrixSub.bytes);
            const rawLen = Math.min(fieldMatrixSub.totalSize, view.byteLength - fieldStart);
            child._rawBytes = new Uint8Array(view.buffer, view.byteOffset + fieldStart, Math.max(0, rawLen));
            if (totalElements === 1) {
              fields[fn] = child;
            } else {
              if (!fields[fn]) {
                fields[fn] = [];
              }
              fields[fn].push(child);
            }
          }
          offset += fieldMatrixSub.totalSize;
        }
      }
      result.fields = fields;
    }
  } else if (arrayClass === 1) {
    const cells = [];
    for (let i = 0; i < totalElements && offset < end; i++) {
      const cellSub = readSubelement(view, offset);
      if (cellSub.type === MI_MATRIX) {
        const child = parseMatrix(view, offset + 8, cellSub.bytes);
        cells.push(child);
      } else {
        cells.push(null);
      }
      offset += cellSub.totalSize;
    }
    result.value = cells;
  }
  return result;
}
function parseMat(arrayBuffer2) {
  const buf = new Uint8Array(arrayBuffer2);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (buf.length < 128) {
    throw new Error("Not a MAT-file: shorter than the 128-byte header");
  }
  const headerBytes = new Uint8Array(buf.buffer, buf.byteOffset, 116);
  const header = new TextDecoder().decode(headerBytes).trim();
  if (header.startsWith("MATLAB 7.3 MAT-file")) {
    throw new Error("MAT-file version 7.3 (HDF5) is not supported");
  }
  const endianIndicator = String.fromCharCode(buf[126]) + String.fromCharCode(buf[127]);
  if (endianIndicator !== "IM") {
    throw new Error("Big-endian MAT files not supported");
  }
  const variables = [];
  const warnings = [];
  let offset = 128;
  const nameFor = (variable) => variable._anonymous ? "" : variable.name;
  while (offset < buf.length) {
    if (offset + 8 > buf.length) {
      warnings.push({
        code: "part-unreadable",
        message: `The file ends with ${buf.length - offset} byte(s) where a record header needs 8, so anything stored after the last variable read was not read.`
      });
      break;
    }
    const dataType = view.getUint32(offset, true);
    const numBytes = view.getUint32(offset + 4, true);
    if (dataType === 0 && numBytes === 0) {
      break;
    }
    const missing = offset + 8 + numBytes - buf.length;
    let shortened = "";
    if (dataType === MI_COMPRESSED) {
      const compressed = buf.slice(offset + 8, offset + 8 + numBytes);
      let pako;
      try {
        pako = decompressZlib(compressed);
      } catch (err2) {
        warnings.push({
          code: "part-unreadable",
          message: `A compressed record at byte ${offset} could not be decompressed (${reasonOf(err2)}), so the variable it holds was not read.`
        });
        offset += 8 + numBytes;
        continue;
      }
      const deView = new DataView(pako.buffer, pako.byteOffset, pako.byteLength);
      const innerType = deView.getUint32(0, true);
      const innerBytes = deView.getUint32(4, true);
      if (innerType === MI_MATRIX) {
        const variable = parseMatrix(deView, 8, innerBytes);
        if (variable.name) {
          variable._rawBytes = new Uint8Array(pako.buffer, pako.byteOffset, pako.byteLength);
          variables.push(variable);
        } else {
          variables.push({ name: "", className: "", dimensions: [], isComplex: false, isLogical: false, value: null, fields: null, _rawBytes: new Uint8Array(pako.buffer, pako.byteOffset, pako.byteLength), _anonymous: true });
        }
        shortened = nameFor(variables[variables.length - 1]);
      } else {
        warnings.push({
          code: "part-unreadable",
          message: `A compressed record at byte ${offset} holds a data element of type ${innerType} where a variable has to be a matrix, so it was not read.`
        });
      }
    } else if (dataType === MI_MATRIX) {
      const variable = parseMatrix(view, offset + 8, numBytes);
      if (variable.name) {
        variable._rawBytes = buf.slice(offset, offset + 8 + numBytes);
        variables.push(variable);
      } else {
        variables.push({ name: "", className: "", dimensions: [], isComplex: false, isLogical: false, value: null, fields: null, _rawBytes: buf.slice(offset, offset + 8 + numBytes), _anonymous: true });
      }
      shortened = nameFor(variables[variables.length - 1]);
    } else {
      warnings.push({
        code: "part-unreadable",
        message: `A data element of type ${dataType} at byte ${offset} is not a variable, so it was not read.`
      });
    }
    if (missing > 0) {
      const short = {
        code: "part-unreadable",
        message: `A record at byte ${offset} declares ${numBytes} bytes and the file holds only ${Math.max(0, buf.length - offset - 8)}, so it was read short.`
      };
      if (shortened) {
        short.part = shortened;
      }
      warnings.push(short);
    }
    offset += 8 + numBytes;
  }
  for (const variable of variables) {
    collectUndecoded(variable, variable.name || "<unnamed>", warnings);
  }
  return { header, variables, warnings };
}
function collectUndecoded(variable, path, warnings) {
  if (variable.undecoded) {
    warnings.push({
      code: "part-unreadable",
      message: `"${path}" was not decoded: ${variable.undecoded}.`,
      part: path
    });
  } else if (variable.className === "unknown") {
    warnings.push({
      code: "part-unreadable",
      message: `"${path}" is of a MAT array class this reader does not model, so its value was not read.`,
      part: path
    });
  }
  if (variable.fields) {
    for (const [name, field] of Object.entries(variable.fields)) {
      if (Array.isArray(field)) {
        field.forEach((entry, i) => collectUndecoded(entry, `${path}(${i + 1}).${name}`, warnings));
      } else {
        collectUndecoded(field, `${path}.${name}`, warnings);
      }
    }
  }
  if (variable.className === "cell" && Array.isArray(variable.value)) {
    const cells = variable.value;
    const declared = variable.dimensions.reduce((a, b) => a * b, 1);
    const read = cells.filter((cell) => cell !== null).length;
    if (declared > read) {
      warnings.push({
        code: "part-unreadable",
        message: `"${path}" declares ${declared} cell(s) and only ${read} could be read.`,
        part: path
      });
    }
    cells.forEach((cell, i) => {
      if (cell) {
        collectUndecoded(cell, `${path}{${i + 1}}`, warnings);
      }
    });
  }
}
function decompressZlib(compressed) {
  return inflateZlib(compressed);
}

// node_modules/data-explorer-core/dist/datamodel/parser/McosParser.js
var MI_MATRIX2 = 14;
var MCOS_HANDLE_MAGIC = 3707764736;
var MAX_RECURSION_DEPTH = 32;
var NOT_AVAILABLE = "<not available>";
var STRING_CLASS_NAME = "string";
function align82(n) {
  return n + (8 - n % 8) % 8;
}
function readSubelement2(view, offset) {
  if (offset < 0 || offset + 8 > view.byteLength) {
    return null;
  }
  const tag = view.getUint32(offset, true);
  const hi = tag >>> 16 & 65535;
  const lo = tag & 65535;
  if (hi !== 0 && lo !== 0) {
    return { type: lo, bytes: hi, dataOffset: offset + 4, totalSize: 8 };
  }
  const type = view.getUint32(offset, true);
  const bytes = view.getUint32(offset + 4, true);
  return { type, bytes, dataOffset: offset + 8, totalSize: 8 + align82(bytes) };
}
function readableBytes(view, sub) {
  return Math.max(0, Math.min(sub.bytes, view.byteLength - sub.dataOffset));
}
function uint8Bytes(matrix) {
  return matrix.className === "uint8" && Array.isArray(matrix.value) ? new Uint8Array(matrix.value) : null;
}
function findCellArrayInOpaque(view, opaqueContentOffset, opaqueContentLength) {
  let offset = opaqueContentOffset;
  const end = Math.min(opaqueContentOffset + opaqueContentLength, view.byteLength);
  const flagsSub = readSubelement2(view, offset);
  if (!flagsSub)
    return null;
  offset += flagsSub.totalSize;
  while (offset < end) {
    const sub = readSubelement2(view, offset);
    if (!sub)
      return null;
    if (sub.type === MI_MATRIX2) {
      return { offset: sub.dataOffset, length: readableBytes(view, sub) };
    }
    offset += sub.totalSize;
  }
  return null;
}
function extractCells(anonRawBytes) {
  const outerView = new DataView(anonRawBytes.buffer, anonRawBytes.byteOffset, anonRawBytes.byteLength);
  if (outerView.byteLength < 16 || outerView.getUint32(0, true) !== MI_MATRIX2)
    return null;
  const outerMatrix = parseMatrix(outerView, 8, Math.min(outerView.getUint32(4, true), outerView.byteLength - 8));
  const blobBytes = uint8Bytes(outerMatrix);
  if (!blobBytes || blobBytes.length < 16)
    return null;
  const blobView = new DataView(blobBytes.buffer, blobBytes.byteOffset, blobBytes.byteLength);
  const structSub = readSubelement2(blobView, 8);
  if (!structSub || structSub.type !== MI_MATRIX2)
    return null;
  const structMatrix = parseMatrix(blobView, structSub.dataOffset, readableBytes(blobView, structSub));
  const mcosField = structMatrix.fields && structMatrix.fields["MCOS"] ? structMatrix.fields["MCOS"] : null;
  if (!mcosField || !mcosField.isOpaque || !mcosField._rawBytes)
    return null;
  const opaqueView = new DataView(mcosField._rawBytes.buffer, mcosField._rawBytes.byteOffset, mcosField._rawBytes.byteLength);
  const opaqueTag = readSubelement2(opaqueView, 0);
  if (!opaqueTag || opaqueTag.type !== MI_MATRIX2)
    return null;
  const cellLoc = findCellArrayInOpaque(opaqueView, opaqueTag.dataOffset, readableBytes(opaqueView, opaqueTag));
  if (!cellLoc)
    return null;
  const cellArray = parseMatrix(opaqueView, cellLoc.offset, cellLoc.length);
  if (cellArray.className !== "cell" || !Array.isArray(cellArray.value))
    return null;
  return cellArray.value;
}
function parseMetaTable(cells) {
  if (cells.length < 1 || !cells[0])
    return null;
  const metadata = uint8Bytes(cells[0]);
  if (!metadata || metadata.length < 40)
    return null;
  const view = new DataView(metadata.buffer, metadata.byteOffset, metadata.byteLength);
  const u32 = (o) => view.getUint32(o, true);
  const w = [];
  for (let i = 0; i < 10; i++)
    w.push(u32(i * 4));
  if (!(40 <= w[2] && w[2] <= w[3] && w[3] <= w[4] && w[4] <= w[5] && w[5] <= w[6] && w[6] <= metadata.length)) {
    return null;
  }
  const decoder3 = new TextDecoder();
  const strings = [""];
  for (let p = 40; p < w[2]; ) {
    let e = p;
    while (e < w[2] && metadata[e] !== 0)
      e++;
    strings.push(decoder3.decode(metadata.slice(p, e)));
    p = e + 1;
  }
  const classes = [];
  for (let p = w[2]; p + 16 <= w[3]; p += 16) {
    const pkg = strings[u32(p)] || "";
    const cls = strings[u32(p + 4)] || "";
    classes.push({ fullName: pkg ? pkg + "." + cls : cls });
  }
  const objects = [];
  for (let p = w[4]; p + 24 <= w[5]; p += 24) {
    objects.push({ classId: u32(p), blockIdx: u32(p + 16), type1Idx: u32(p + 12) });
  }
  const readBlocks = (from, to) => {
    const out = [];
    for (let p = from; p < to; ) {
      const start = p;
      const nProps = u32(p);
      p += 4;
      if (nProps > 1e3 || p + nProps * 12 > to)
        break;
      const triples = [];
      for (let k = 0; k < nProps; k++) {
        triples.push([u32(p), u32(p + 4), u32(p + 8)]);
        p += 12;
      }
      out.push(triples);
      p = start + align82(p - start);
    }
    return out;
  };
  return {
    strings,
    classes,
    objects,
    blocks: readBlocks(w[5], w[6]),
    type1Blocks: readBlocks(w[3], w[4])
  };
}
function isObjectHandle(cell) {
  if (cell.className !== "uint32")
    return false;
  const v = cell.value;
  return Array.isArray(v) && v.length >= 5 && v[0] === MCOS_HANDLE_MAGIC;
}
function objectHandleFromValue(v) {
  const ndims = v[1];
  if (ndims < 1 || ndims > 8 || 2 + ndims > v.length)
    return null;
  const dims = [];
  for (let d = 0; d < ndims; d++)
    dims.push(v[2 + d]);
  const count = dims.reduce((a, b) => a * b, 1);
  if (count < 1 || 2 + ndims + count > v.length)
    return null;
  const ids = [];
  for (let k = 0; k < count; k++)
    ids.push(v[2 + ndims + k]);
  return { dims, ids };
}
function buildMatrixValue(dims, elements) {
  const rows = dims[0];
  const cols = dims[1];
  const rowStrs = [];
  for (let r = 0; r < rows; r++) {
    const vals = [];
    for (let c = 0; c < cols; c++) {
      vals.push(formatMatlabNum(elements[r * cols + c]));
    }
    rowStrs.push("[" + vals.join(", ") + "]");
  }
  return { _type: "double", _value: "Matrix(" + rows + "," + cols + ")\n" + rowStrs.join("\n") };
}
function resolveValue(cell, ctx, path, depth) {
  if (!cell)
    return void 0;
  if (isObjectHandle(cell)) {
    const handle = objectHandleFromValue(cell.value);
    if (!handle || handle.ids.length === 1) {
      const refId = handle ? handle.ids[0] : cell.value[4];
      return buildObjectValue(refId, ctx, path, depth + 1);
    }
    const cls2 = ctx.meta.classes[ctx.meta.objects[handle.ids[0]]?.classId];
    const dims = handle.dims.length >= 2 ? handle.dims.slice() : [1, handle.ids.length];
    return {
      _array_class: cls2 ? cls2.fullName : "",
      _array_type: "MATLABArray",
      _dimensions: dims,
      _mw_element_type: "MATLABArray",
      _elements: handle.ids.map((id) => ({ _properties: buildProperties(id, ctx, path, depth + 1) }))
    };
  }
  const cls = cell.className;
  const val = cell.value;
  if (cls === "struct") {
    return buildStructValue(cell, ctx, path, depth);
  }
  if (cls === "cell") {
    const elems = Array.isArray(val) ? val : [];
    return {
      _array_type: "Cell",
      _dimensions: cell.dimensions || [1, elems.length],
      _elements: elems.map((e) => resolveValue(e, ctx, path, depth)),
      _mw_element_type: "MATLABArray"
    };
  }
  if (cls === "char") {
    return typeof val === "string" ? val : "";
  }
  if (cell.isLogical) {
    if (Array.isArray(val))
      return val.map((x) => !!x);
    return !!val;
  }
  if (typeof val === "number" || isExactToken(val)) {
    return val;
  }
  if (Array.isArray(val)) {
    if (val.length === 0)
      return [];
    const dims = cell.dimensions || [1, val.length];
    if (dims.length >= 2 && dims[0] > 1 && dims[1] > 1) {
      return buildMatrixValue(dims, val);
    }
    return val;
  }
  return void 0;
}
function buildStructValue(cell, ctx, path, depth) {
  const fields = cell.fields || {};
  const element2 = {};
  const fieldNames = [];
  for (const [fieldName, fieldVar] of Object.entries(fields)) {
    const fv = Array.isArray(fieldVar) ? fieldVar[0] : fieldVar;
    element2[fieldName] = resolveValue(fv, ctx, path, depth);
    fieldNames.push(fieldName);
  }
  return {
    _array_type: "Struct",
    _dimensions: cell.dimensions || [1, 1],
    _elements: [element2],
    _fields: fieldNames,
    _mw_element_type: "MATLABArray"
  };
}
function buildProperties(objId, ctx, path, depth) {
  const props = {};
  if (depth > MAX_RECURSION_DEPTH || path.has(objId))
    return props;
  const obj = ctx.meta.objects[objId];
  if (!obj)
    return props;
  path.add(objId);
  const dflt2 = ctx.defaults[obj.classId];
  if (dflt2 && dflt2.className === "struct" && dflt2.fields) {
    for (const [fieldName, fieldVar] of Object.entries(dflt2.fields)) {
      const fv = Array.isArray(fieldVar) ? fieldVar[0] : fieldVar;
      const resolved = resolveValue(fv, ctx, path, depth);
      if (resolved !== void 0) {
        props[fieldName] = resolved;
      }
    }
  }
  const block = ctx.meta.blocks[obj.blockIdx] || [];
  for (const [nameIdx, flag, value] of block) {
    const name = ctx.meta.strings[nameIdx];
    if (!name)
      continue;
    let resolved;
    if (flag === 1) {
      resolved = resolveValue(ctx.cells[value + 2] || null, ctx, path, depth);
    } else if (flag === 0) {
      resolved = ctx.meta.strings[value] ?? "";
    } else if (flag === 2) {
      resolved = value !== 0;
    } else {
      continue;
    }
    if (resolved !== void 0) {
      props[name] = resolved;
    }
  }
  path.delete(objId);
  return props;
}
function buildObjectValue(objId, ctx, path, depth) {
  const obj = ctx.meta.objects[objId];
  if (!obj)
    return void 0;
  const cls = ctx.meta.classes[obj.classId];
  if (cls && cls.fullName === STRING_CLASS_NAME) {
    return stringObjectValue(objId, ctx);
  }
  const properties = buildProperties(objId, ctx, path, depth);
  return { _object_class: cls ? cls.fullName : "", _properties: properties };
}
var STRING_PAYLOAD_PROP = "any";
var STRING_PAYLOAD_VERSION = 1;
var STRING_MISSING_COUNT = 18446744073709551615n;
var UNITS_PER_WORD = 4;
var MAX_STRING_UNITS = 2147483647;
var FROM_CHAR_CODE_CHUNK = 4096;
function stringPayloadWords(objId, ctx) {
  const obj = ctx.meta.objects[objId];
  if (!obj || obj.type1Idx === 0)
    return null;
  const block = ctx.meta.type1Blocks[obj.type1Idx];
  if (!block || block.length !== 1)
    return null;
  const [nameIdx, flag, value] = block[0];
  if (flag !== 1 || ctx.meta.strings[nameIdx] !== STRING_PAYLOAD_PROP)
    return null;
  const cell = ctx.cells[value + 2];
  if (!cell || cell.className !== "uint64")
    return null;
  const v = cell.value;
  if (Array.isArray(v))
    return v;
  return typeof v === "number" || isExactToken(v) ? [v] : null;
}
function payloadWord(word) {
  if (typeof word === "number") {
    return Number.isSafeInteger(word) && word >= 0 ? BigInt(word) : null;
  }
  if (typeof word === "string" && isExactToken(word)) {
    const n = BigInt(word);
    return n >= 0n ? n : null;
  }
  return null;
}
function textFromUnits(units) {
  if (units.length <= FROM_CHAR_CODE_CHUNK)
    return String.fromCharCode(...units);
  let out = "";
  for (let i = 0; i < units.length; i += FROM_CHAR_CODE_CHUNK) {
    out += String.fromCharCode(...units.slice(i, i + FROM_CHAR_CODE_CHUNK));
  }
  return out;
}
function decodeStringElements(words, countStart, numel) {
  const counts = [];
  let totalUnits = 0;
  for (let i = 0; i < numel; i++) {
    const w = payloadWord(words[countStart + i]);
    if (w === null)
      return null;
    if (w === STRING_MISSING_COUNT) {
      counts.push(null);
      continue;
    }
    if (w > BigInt(MAX_STRING_UNITS))
      return null;
    const n = Number(w);
    counts.push(n);
    totalUnits += n;
  }
  const dataStart = countStart + numel;
  const wordsNeeded = Math.ceil(totalUnits / UNITS_PER_WORD);
  if (dataStart + wordsNeeded > words.length)
    return null;
  const units = [];
  for (let i = 0; i < wordsNeeded; i++) {
    const packed = payloadWord(words[dataStart + i]);
    if (packed === null)
      return null;
    for (let j = 0; j < UNITS_PER_WORD; j++) {
      units.push(Number(packed >> BigInt(16 * j) & 0xffffn));
    }
  }
  const elements = [];
  let at = 0;
  for (const count of counts) {
    if (count === null) {
      elements.push(null);
      continue;
    }
    elements.push(textFromUnits(units.slice(at, at + count)));
    at += count;
  }
  return elements;
}
function stringPayload(objId, ctx) {
  const words = stringPayloadWords(objId, ctx);
  if (!words || words.length < 3)
    return null;
  if (words[0] !== STRING_PAYLOAD_VERSION)
    return null;
  const ndims = words[1];
  if (typeof ndims !== "number" || ndims < 2 || ndims > 8 || 2 + ndims > words.length)
    return null;
  const raw = words.slice(2, 2 + ndims);
  if (!raw.every((d) => typeof d === "number" && Number.isInteger(d) && d >= 0))
    return null;
  const dims = raw;
  const numel = dims.reduce((a, b) => a * b, 1);
  const elements = numel === 0 ? [] : decodeStringElements(words, 2 + ndims, numel);
  return { dims, elements };
}
function stringObjectValue(objId, ctx) {
  const payload = stringPayload(objId, ctx);
  if (!payload || !payload.elements)
    return NOT_AVAILABLE;
  return {
    _array_type: "String",
    _dimensions: payload.dims.slice(),
    _elements: payload.elements.slice(),
    _mw_element_type: "MATLABArray"
  };
}
function splitClassName(fullClassName) {
  const lastDot = fullClassName.lastIndexOf(".");
  if (lastDot === -1)
    return { packageName: "", shortClassName: fullClassName };
  return { packageName: fullClassName.substring(0, lastDot), shortClassName: fullClassName.substring(lastDot + 1) };
}
function objectHandleFromRaw(rawBytes) {
  if (!rawBytes || rawBytes.length < 4)
    return null;
  const view = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);
  for (let o = 0; o + 8 <= rawBytes.length; o += 4) {
    if (view.getUint32(o, true) !== MCOS_HANDLE_MAGIC)
      continue;
    const word = (i) => view.getUint32(o + i * 4, true);
    const ndims = word(1);
    if (ndims < 1 || ndims > 8 || o + (2 + ndims) * 4 > rawBytes.length)
      return null;
    const dims = [];
    for (let d = 0; d < ndims; d++)
      dims.push(word(2 + d));
    const count = dims.reduce((a, b) => a * b, 1);
    if (count < 1 || o + (2 + ndims + count) * 4 > rawBytes.length)
      return null;
    const ids = [];
    for (let k = 0; k < count; k++)
      ids.push(word(2 + ndims + k));
    return { dims, ids };
  }
  return null;
}
function decodeMcosBlob(anonRawBytes, opaqueVars) {
  const result = /* @__PURE__ */ new Map();
  if (!anonRawBytes || anonRawBytes.length === 0 || opaqueVars.length === 0)
    return result;
  const cells = extractCells(anonRawBytes);
  if (!cells)
    return result;
  const meta = parseMetaTable(cells);
  if (!meta)
    return result;
  const lastCell = cells.length > 0 ? cells[cells.length - 1] : null;
  const defaults = lastCell && lastCell.className === "cell" && Array.isArray(lastCell.value) ? lastCell.value : [];
  const ctx = { cells, meta, defaults };
  for (const v of opaqueVars) {
    const handle = objectHandleFromRaw(v.rawBytes);
    if (!handle || handle.ids.length === 0)
      continue;
    const idsInRange = handle.ids.every((id) => id > 0 && id < meta.objects.length);
    if (!idsInRange)
      continue;
    const classesMatch = handle.ids.every((id) => {
      const cls = meta.classes[meta.objects[id].classId];
      return cls && cls.fullName === v.className;
    });
    if (!classesMatch)
      continue;
    const elements = handle.ids.map((id) => buildProperties(id, ctx, /* @__PURE__ */ new Set(), 0));
    const payload = v.className === STRING_CLASS_NAME ? stringPayload(handle.ids[0], ctx) : null;
    const dimensions = payload?.dims ?? (handle.dims.length >= 2 ? handle.dims.slice() : [1, handle.dims[0] ?? elements.length]);
    const { packageName, shortClassName } = splitClassName(v.className);
    result.set(v.name, {
      name: v.name,
      className: v.className,
      packageName,
      shortClassName,
      properties: elements[0] ?? {},
      elements,
      dimensions,
      value: (elements[0] ?? {}).Value,
      ...v.className === STRING_CLASS_NAME ? { stringElements: payload?.elements ?? null } : {}
    });
  }
  return result;
}

// node_modules/data-explorer-core/dist/datamodel/parser/MatWriter.js
var MatWriteError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "MatWriteError";
  }
};
var MI_INT82 = 1;
var MI_UINT82 = 2;
var MI_INT162 = 3;
var MI_UINT162 = 4;
var MI_INT322 = 5;
var MI_UINT322 = 6;
var MI_SINGLE2 = 7;
var MI_DOUBLE2 = 9;
var MI_INT642 = 12;
var MI_UINT642 = 13;
var MI_MATRIX3 = 14;
var MI_UTF82 = 16;
var MX_CELL = 1;
var MX_STRUCT = 2;
var MX_CHAR = 4;
var MX_UINT8 = 9;
var CLASS_CODE = {
  cell: MX_CELL,
  struct: MX_STRUCT,
  char: MX_CHAR,
  double: 6,
  single: 7,
  int8: 8,
  uint8: MX_UINT8,
  int16: 10,
  uint16: 11,
  int32: 12,
  uint32: 13,
  int64: 14,
  uint64: 15,
  // A logical array is not its own MAT class: MATLAB writes class uint8 with the
  // logical flag set, which is what MatParser reads back as isLogical.
  logical: MX_UINT8
};
var PAYLOAD_TYPE = {
  6: MI_DOUBLE2,
  7: MI_SINGLE2,
  8: MI_INT82,
  9: MI_UINT82,
  10: MI_INT162,
  11: MI_UINT162,
  12: MI_INT322,
  13: MI_UINT322,
  14: MI_INT642,
  15: MI_UINT642
};
var WIDTH = {
  [MI_INT82]: 1,
  [MI_UINT82]: 1,
  [MI_INT162]: 2,
  [MI_UINT162]: 2,
  [MI_INT322]: 4,
  [MI_UINT322]: 4,
  [MI_SINGLE2]: 4,
  [MI_DOUBLE2]: 8,
  [MI_INT642]: 8,
  [MI_UINT642]: 8
};
var CDATA_PREAMBLE = [0, 1, 73, 77, 0, 0, 0, 0];
function concat(parts) {
  let total = 0;
  for (const p of parts) {
    total += p.length;
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}
function u32le(n) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, n >>> 0, true);
  return out;
}
function element(type, data) {
  if (data.length > 0 && data.length <= 4) {
    const out = new Uint8Array(8);
    const view = new DataView(out.buffer);
    view.setUint16(0, type, true);
    view.setUint16(2, data.length, true);
    out.set(data, 4);
    return out;
  }
  const pad2 = (8 - data.length % 8) % 8;
  return concat([u32le(type), u32le(data.length), data, new Uint8Array(pad2)]);
}
function arrayFlags(cls, complex, logical) {
  const data = new Uint8Array(8);
  data[0] = cls;
  data[1] = (complex ? 8 : 0) | (logical ? 2 : 0);
  return element(MI_UINT322, data);
}
function dimsElement(d) {
  const data = new Uint8Array(d.length * 4);
  const view = new DataView(data.buffer);
  d.forEach(function(n, i) {
    view.setInt32(i * 4, n, true);
  });
  return element(MI_INT322, data);
}
function emptyName() {
  return element(MI_INT82, new Uint8Array(0));
}
function dimsOf(v) {
  const d = (v.dimensions || []).slice();
  while (d.length < 2) {
    d.push(1);
  }
  return d;
}
function elementCountOf(d) {
  return d.reduce(function(a, b) {
    return a * b;
  }, 1);
}
function emptyDoubleBytes() {
  return element(MI_MATRIX3, concat([arrayFlags(CLASS_CODE.double, false, false), dimsElement([0, 0]), emptyName(), element(MI_DOUBLE2, new Uint8Array(0))]));
}
function toBigInt(n) {
  if (typeof n === "string") {
    try {
      return BigInt(n);
    } catch {
      return 0n;
    }
  }
  return isFinite(n) ? BigInt(Math.round(n)) : 0n;
}
function numericPayload(type, values) {
  const width = WIDTH[type];
  if (!width) {
    throw new MatWriteError("no payload width for MAT element type " + type);
  }
  const data = new Uint8Array(values.length * width);
  const view = new DataView(data.buffer);
  values.forEach(function(v, i) {
    const at = i * width;
    const n = typeof v === "number" ? v : Number(v);
    switch (type) {
      case MI_INT82:
        view.setInt8(at, n);
        break;
      case MI_UINT82:
        view.setUint8(at, n);
        break;
      case MI_INT162:
        view.setInt16(at, n, true);
        break;
      case MI_UINT162:
        view.setUint16(at, n, true);
        break;
      case MI_INT322:
        view.setInt32(at, n, true);
        break;
      case MI_UINT322:
        view.setUint32(at, n, true);
        break;
      case MI_SINGLE2:
        view.setFloat32(at, n, true);
        break;
      // `v` and not `n`: the coercion above is a double, and putting an exact 64-bit
      // token through it is exactly the rounding this representation exists to avoid.
      case MI_INT642:
        view.setBigInt64(at, toBigInt(v), true);
        break;
      case MI_UINT642:
        view.setBigUint64(at, toBigInt(v), true);
        break;
      default:
        view.setFloat64(at, n, true);
        break;
    }
  });
  return element(type, data);
}
function flatValues(value) {
  if (value === null || value === void 0) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
function exactPart(x) {
  if (isExactToken(x)) {
    return x;
  }
  return Number(x) || 0;
}
function realPart(x) {
  if (x !== null && typeof x === "object" && "re" in x) {
    return exactPart(x.re);
  }
  return exactPart(x);
}
function imagPart(x) {
  if (x !== null && typeof x === "object" && "im" in x) {
    return exactPart(x.im);
  }
  return 0;
}
function numericBody(v, cls, d) {
  const flat = flatValues(v.value);
  const n = elementCountOf(d);
  if (flat.length !== n) {
    throw new MatWriteError("numeric value has " + flat.length + " elements but declares [" + d.join(",") + "]");
  }
  const type = PAYLOAD_TYPE[cls];
  const real = transposeToColumnMajorND(flat.map(realPart), d);
  const parts = [numericPayload(type, real)];
  if (v.isComplex) {
    parts.push(numericPayload(type, transposeToColumnMajorND(flat.map(imagPart), d)));
  }
  return parts;
}
function charBody(v, d) {
  const text = typeof v.value === "string" ? v.value : String(v.value ?? "");
  if (text.length !== elementCountOf(d)) {
    throw new MatWriteError("char value has " + text.length + " characters but declares [" + d.join(",") + "]");
  }
  return [element(MI_UTF82, new TextEncoder().encode(text))];
}
function cellBody(v, d) {
  const cells = flatValues(v.value);
  const n = elementCountOf(d);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const c = cells[i];
    parts.push(c ? encodeMatVariable(c) : emptyDoubleBytes());
  }
  return parts;
}
function structBody(v, d) {
  const fields = v.fields || {};
  const names = Object.keys(fields);
  const longest = names.reduce(function(a, s) {
    return Math.max(a, s.length);
  }, 0);
  const stride = Math.max(longest, 4) + 1;
  const strideData = new Uint8Array(4);
  new DataView(strideData.buffer).setInt32(0, stride, true);
  const nameData = new Uint8Array(names.length * stride);
  const enc = new TextEncoder();
  names.forEach(function(name, i) {
    nameData.set(enc.encode(name), i * stride);
  });
  const parts = [element(MI_INT322, strideData), element(MI_INT82, nameData)];
  const n = elementCountOf(d);
  for (let e = 0; e < n; e++) {
    for (const name of names) {
      const held = fields[name];
      const one = Array.isArray(held) ? held[e] : n === 1 ? held : void 0;
      parts.push(one ? encodeMatVariable(one) : emptyDoubleBytes());
    }
  }
  return parts;
}
function encodeMatVariable(v) {
  if (v.isOpaque) {
    throw new MatWriteError("cannot write an MCOS opaque value (" + (v.className || "unknown") + ")");
  }
  const cls = CLASS_CODE[v.className];
  if (cls === void 0) {
    throw new MatWriteError('no MAT class for "' + v.className + '"');
  }
  const d = dimsOf(v);
  const logical = !!v.isLogical || v.className === "logical";
  const subs = [arrayFlags(cls, !!v.isComplex, logical), dimsElement(d), emptyName()];
  if (cls === MX_CELL) {
    subs.push(...cellBody(v, d));
  } else if (cls === MX_STRUCT) {
    subs.push(...structBody(v, d));
  } else if (cls === MX_CHAR) {
    subs.push(...charBody(v, d));
  } else {
    subs.push(...numericBody(v, logical ? MX_UINT8 : cls, d));
  }
  return element(MI_MATRIX3, concat(subs));
}
function encodeCdata(v) {
  return uuencode(concat([new Uint8Array(CDATA_PREAMBLE), encodeMatVariable(v)]));
}

// node_modules/data-explorer-core/dist/datamodel/node/data/matlabValueRules.js
function emptyDouble() {
  return {
    name: "",
    className: "double",
    dimensions: [0, 0],
    isComplex: false,
    isLogical: false,
    value: [],
    fields: null
  };
}
function formatStringElement(el) {
  if (el === null)
    return MISSING_STRING;
  return formatMatlabString(el !== void 0 ? String(el) : "");
}
var TYPED_NUMERIC_CLASS = /^(?:u?int(?:8|16|32|64)|single)$/;
function classAfterEdit(current, parsedType) {
  return parsedType === "double" && TYPED_NUMERIC_CLASS.test(current) ? current : parsedType;
}
function elementClass(arrayClass) {
  return TYPED_NUMERIC_CLASS.test(arrayClass) || arrayClass === "logical" ? arrayClass : "double";
}
function needsTypedLiteral(type, value) {
  if (TYPED_NUMERIC_CLASS.test(type)) {
    return true;
  }
  if (type === "logical") {
    return typeof value !== "boolean";
  }
  return typeof value === "number" && !isFinite(value);
}
function formatMatrix(rows, cols, elements) {
  if (elements.length === 0) {
    return EMPTY_NUMERIC;
  }
  const rowStrs = [];
  for (let r = 0; r < rows; r++) {
    const vals = [];
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= elements.length) {
        break;
      }
      vals.push(formatMatlabNum(elements[i]));
    }
    if (vals.length > 0) {
      rowStrs.push(vals.join(" "));
    }
  }
  return "[" + rowStrs.join("; ") + "]";
}
function formatCharMatrix(text, dims) {
  const rows = dims[0];
  const cols = dims[1];
  const rowStrs = [];
  for (let r = 0; r < rows; r++) {
    let row = "";
    for (let c = 0; c < cols; c++) {
      row += text.charAt(c * rows + r);
    }
    rowStrs.push(formatMatlabChar(row));
  }
  return "[" + rowStrs.join("; ") + "]";
}
function parseMatrixValue(raw) {
  const lines = raw._value.split("\n");
  const header = lines[0];
  const dimsMatch = header.match(/^Matrix\((\d+(?:,\d+)*)\)$/);
  if (!dimsMatch) {
    return null;
  }
  const dims = dimsMatch[1].split(",").map(function(s) {
    return parseInt(s, 10);
  });
  const body = lines.slice(1).join("");
  const numbers = [];
  const numMatches = body.match(/-?(?:[\d.]+(?:[eE][+-]?\d+)?|Inf|NaN)/g);
  if (numMatches) {
    const exact = needsExactInt(raw._type);
    numMatches.forEach(function(s) {
      numbers.push(exact ? parseExactNum(s) : parseMatlabNum(s));
    });
  }
  return {
    dims: dims.length >= 2 ? dims : [1, dims[0] || 0],
    elements: numbers,
    type: raw._type
  };
}

// node_modules/data-explorer-core/dist/datamodel/node/data/MatlabVariableNode.js
var MCOS_ICON_MAP = {
  "Simulink.Parameter": "wsParameters",
  "Simulink.Signal": "wsSignal",
  "Simulink.Bus": "wsBus",
  "Simulink.AliasType": "wsAlias",
  "Simulink.NumericType": "wsNumeric",
  "Simulink.ConfigSet": "configurationReference",
  "Simulink.ConfigSetRef": "configurationReference",
  "Simulink.Variant": "wsVariant",
  "Simulink.VariantVariable": "wsVariant",
  "Simulink.VariantControl": "wsVariant",
  "Simulink.VariantBank": "wsParameters_bank",
  "Simulink.VariantBankCoderInfo": "wsParameters_bankCoderInfo",
  "Simulink.LookupTable": "wsLookup",
  "Simulink.Breakpoint": "wsSimulinkBreakpoint",
  "Simulink.ValueType": "wsValue",
  // Not a Simulink class: a `string` reaches the opaque path because MATLAB stores it as
  // an MCOS object, and without this entry the same string array that shows a string icon
  // out of a dictionary showed the default one out of a .mat.
  string: "wsString"
};
var MI_MATRIX4 = 14;
var MatlabVariableNode = class _MatlabVariableNode extends DataNode {
  constructor(name, parent, serial) {
    super(name, parent, serial);
    this._kind = "scalar";
    this._scalarValue = 0;
    this._scalarType = "double";
    this._elements = [];
    this._dims = [1, 1];
    this._rawBytes = null;
    this._matVar = null;
    this._varStale = false;
    this._isOpaque = false;
    this._opaqueClassName = null;
    this._mcosProperties = null;
    this._mcosValue = void 0;
    this._mcosDimensions = null;
    this._preCollapseDims = null;
    this._elementType = null;
  }
  // ---- Display: what the table columns show ----
  // Read-only projections of the state above — nothing here mutates (the one
  // exception, _serializeScalarXml's temporary _kind swap, is in the XML section
  // and restores it). Two rules recur: an opaque MCOS object is checked FIRST
  // because its class name and decoded value override the primitive spellings, and
  // once children exist they are the truth for element values while _elements is
  // the fallback for a not-yet-expanded container.
  get Value() {
    if (this._kind === "scalar") {
      return this._scalarValue;
    }
    if (this._kind === "array") {
      return this.children.length > 0 ? this.children.map(function(c) {
        return c._scalarValue;
      }) : this._elements;
    }
    if (this._kind === "string") {
      return this._elements;
    }
    return null;
  }
  set Value(v) {
    if (this._kind === "scalar") {
      this._scalarValue = v;
    }
  }
  get elements() {
    return this._elements;
  }
  get dims() {
    if (this._isOpaque) {
      return this._mcosDimensions || this._dims;
    }
    if (this._kind === "scalar" && this._scalarType === "char") {
      return this._textDims(this._scalarValue === null || this._scalarValue === void 0 ? "" : String(this._scalarValue));
    }
    return this._dims;
  }
  get arrayType() {
    return this._scalarType;
  }
  get icon() {
    if (this.isDerived) {
      return "typeConstant";
    }
    if (this._isOpaque) {
      return MCOS_ICON_MAP[this._opaqueClassName] || OBJECT_ICON;
    }
    switch (this._kind) {
      case "scalar":
        if (this._scalarType === "logical") {
          return "wsCheck";
        }
        if (this._scalarType === "char") {
          return "wsCharacter";
        }
        if (this._scalarType === "string") {
          return "wsString";
        }
        if (this._scalarType === "struct") {
          return "wsTree";
        }
        if (this._scalarType === "object") {
          return OBJECT_ICON;
        }
        return "wsDefault";
      case "array":
        return this._scalarType === "logical" ? "wsCheck" : "wsDefault";
      case "cell":
        return "wsBrackets";
      case "string":
        return "wsString";
    }
  }
  get className() {
    if (this._isOpaque) {
      return this._opaqueClassName;
    }
    switch (this._kind) {
      case "scalar":
        return this._scalarType === "complex" ? "double" : this._scalarType;
      case "array":
        return this._scalarType === "complex" ? "double" : this._scalarType;
      case "cell":
        return "cell";
      case "string":
        return "string";
    }
  }
  // A primitive variable's data type ('double', 'string', 'cell', …) is a real
  // data type and belongs in the DataType column. An opaque MCOS variable's
  // className is a Class name (e.g. 'Simulink.Parameter'), which is Class, not a
  // data type — suppress it here so the column stays type-only.
  get dataType() {
    if (this._isOpaque) {
      return this._opaqueClassName === "string" ? "string" : "";
    }
    return this.className;
  }
  // A plain MATLAB variable (scalar, array, cell, struct-like, or opaque MCOS
  // object) is a "MATLAB Variable" in Design Data. In Architectural Data the same
  // variable is a Constant (a derived entry with no other catalog classification),
  // so its Kind follows the section. A catalog classification, if present, still
  // wins (mirrors DataNode.kind).
  get kind() {
    if (this.classification) {
      return super.kind;
    }
    return matlabVariableKind(this.isDerived);
  }
  get nameEditable() {
    if (this.parent && this.parent instanceof _MatlabVariableNode) {
      return false;
    }
    if (this.parent?.isObjectPropertyBag) {
      return false;
    }
    return true;
  }
  get valueEditable() {
    if (this._isOpaque) {
      return false;
    }
    if (this.parent instanceof _MatlabVariableNode && this.parent._isOpaque) {
      return false;
    }
    if (this._scalarType === "struct") {
      return false;
    }
    if (this._scalarValue === NOT_AVAILABLE) {
      return false;
    }
    return super.valueEditable;
  }
  // True when this variable currently holds a SCALAR NUMERIC value — the shape a
  // Constant requires. A live-node counterpart to parsedIsScalarNumeric: it is a
  // 1x1 non-opaque scalar whose type is numeric (double/logical/complex, plus the
  // typed int/single scalars loaded from a file, which also carry _kind 'scalar').
  // Arrays, matrices, cells, structs, char, and string are rejected. Used by the
  // Constant value gate and the Variable→Constant paste/drop gate.
  get isScalarNumeric() {
    if (this._isOpaque) {
      return false;
    }
    if (this._kind !== "scalar") {
      return false;
    }
    return this._scalarType !== "struct" && this._scalarType !== "char" && this._scalarType !== "string";
  }
  get displayValue() {
    if (this._isOpaque) {
      if (this._kind === "string") {
        return this._formatString();
      }
      if (this._mcosValue !== void 0 && this._mcosValue !== null) {
        if (typeof this._mcosValue === "number")
          return String(this._mcosValue);
        if (typeof this._mcosValue === "string")
          return this._mcosValue ? formatMatlabChar(this._mcosValue) : summaryForm(this._mcosDimensions || [1, 1], this._opaqueClassName || "double");
        if (Array.isArray(this._mcosValue)) {
          const dims = this._mcosDimensions || [1, this._mcosValue.length];
          return summaryForm(dims, this._opaqueClassName || "double");
        }
      }
      return summaryForm(this._mcosDimensions || [1, 1], this._opaqueClassName || "double");
    }
    switch (this._kind) {
      case "scalar":
        return this._formatScalar();
      case "array":
        return this._formatArray();
      case "cell":
        return this._formatCell();
      case "string":
        return this._formatString();
    }
  }
  _formatScalar() {
    if (this._scalarValue === NOT_AVAILABLE) {
      return NOT_AVAILABLE;
    }
    if (this._scalarType === "char") {
      const s = String(this._scalarValue);
      const dims = this._textDims(s);
      if (dims.length > 2) {
        return summaryForm(dims, "char");
      }
      const text = dims[0] > 1 ? formatCharMatrix(s, dims) : formatMatlabChar(s);
      return overCharBudget(text) ? summaryForm(dims, "char") : text;
    }
    if (this._scalarType === "string") {
      const text = formatMatlabString(String(this._scalarValue));
      return overCharBudget(text) ? summaryForm(this._dims, "string") : text;
    }
    if (this._scalarType === "struct") {
      return summaryForm(this._dims, "struct");
    }
    if (this._scalarType === "logical") {
      return this._scalarValue ? "true" : "false";
    }
    return formatMatlabNum(this._scalarValue);
  }
  // The real extents of a char value. _dims wins when it accounts for every
  // character (a 2x5 char array from a .mat file, MATLAB's mxchar literal, a
  // Dimension= attribute), otherwise the value came in as a bare JSON string that
  // never carried a shape — so it is a plain row vector and its length is its second
  // extent. Empty text is 0x0, which is what MATLAB's '' is: numel 0 and isempty
  // true, where the [1,1] the string path leaves behind would claim one character.
  //
  // Every channel that needs a char's shape reads it from here — the display, the
  // `dims` accessor, both .sldd writers and the .mat writer — so there is one answer
  // rather than five.
  _textDims(text) {
    if (text === "") {
      return elementCount(this._dims) === 0 ? this._dims : [0, 0];
    }
    return elementCount(this._dims) === text.length ? this._dims : [1, text.length];
  }
  _formatArray() {
    const elems = this.children.length > 0 ? this.children.map(function(c) {
      return c._scalarValue;
    }) : this._elements;
    if (elems.length === 0) {
      return EMPTY_NUMERIC;
    }
    if (needsSummary(this._dims)) {
      return summaryForm(this._dims, this.className);
    }
    const formatted = this._scalarType === "logical" ? elems.map(function(v) {
      return v ? "true" : "false";
    }) : elems;
    const text = formatMatrix(this._dims[0], this._dims[1], formatted);
    return overCharBudget(text) ? summaryForm(this._dims, this.className) : text;
  }
  _formatCell() {
    if (this.children.length === 0) {
      return EMPTY_CELL;
    }
    if (needsSummary(this._dims)) {
      return summaryForm(this._dims, "cell");
    }
    const rows = this._dims[0];
    const cols = this._dims[1];
    const rowStrs = [];
    for (let r = 0; r < rows; r++) {
      const vals = [];
      for (let c = 0; c < cols; c++) {
        const child = this.children[c * rows + r];
        vals.push(child ? child.displayValue : EMPTY_NUMERIC);
      }
      rowStrs.push(vals.join(", "));
    }
    const text = "{" + rowStrs.join("; ") + "}";
    return overCharBudget(text) ? summaryForm(this._dims, "cell") : text;
  }
  _formatString() {
    const d = this._dims;
    if (d[0] === 1 && d[1] === 1 && this._elements.length === 1) {
      const text2 = formatStringElement(this._elements[0]);
      return overCharBudget(text2) ? summaryForm(d, "string") : text2;
    }
    if (needsSummary(d)) {
      return summaryForm(d, "string");
    }
    if (this._elements.length === 0) {
      return EMPTY_NUMERIC;
    }
    const rows = d[0];
    const cols = d[1];
    const rowStrs = [];
    for (let r = 0; r < rows; r++) {
      const vals = [];
      for (let c = 0; c < cols; c++) {
        vals.push(formatStringElement(this._elements[c * rows + r]));
      }
      rowStrs.push(vals.join(" "));
    }
    const text = "[" + rowStrs.join("; ") + "]";
    return overCharBudget(text) ? summaryForm(d, "string") : text;
  }
  /**
   * Every element's label and displayed value — the two strings an element ROW
   * carries — whether or not this array was expanded into element children.
   *
   * The consuming extension's Variable Editor grid is drawn from these. It used to
   * read them off the child nodes, which tied a read-only panel the user opens
   * deliberately to a decision made for the TABLE: MAX_EXPANDED_ELEMENTS stops a
   * 1000x1000 from becoming a million rows nobody scrolls, and took the grid's data
   * with it. This accessor is the separation. The table's limit stays where it is,
   * and the panel asks for the elements when it is opened — so the cost of a million
   * of them is paid by the gesture that wanted them, and by nothing else.
   *
   * `label` is the subscript form, from the same function BaseNode.displayName calls
   * and with the same order/bracket rules; `value` is the element's displayValue.
   * Where the children DO exist they ARE the answer — not a second derivation of it —
   * so the two paths cannot drift apart. test/displayElements.test.ts pins that
   * agreement rather than either path alone.
   *
   * null for a kind that has no elements (a scalar, a struct, an object): an empty
   * list is a different and also true answer, meaning an array with nothing in it.
   */
  displayElements() {
    if (this._kind !== "array" && this._kind !== "cell" && this._kind !== "string") {
      return null;
    }
    if (this.children.length > 0) {
      return this.children.map(function(c) {
        return { label: c.displayName, value: c.displayValue };
      });
    }
    const name = this.displayName;
    const dims = this._dims;
    const order = this._kind === "array" ? "row-major" : "column-major";
    const bracket = this._kind === "cell" ? "{}" : "()";
    const scratch = this._kind === "string" ? this._makeStringElement("1", "") : _MatlabVariableNode._createScalar(0, this._elementType || elementClass(this._scalarType), "1", null);
    const isString = scratch._kind === "string";
    const out = new Array(this._elements.length);
    for (let i = 0; i < this._elements.length; i++) {
      if (isString) {
        scratch._elements[0] = this._elements[i];
      } else {
        scratch._scalarValue = this._elements[i];
      }
      out[i] = {
        label: subscriptLabel(name, i, dims, order, bracket),
        value: scratch.displayValue
      };
    }
    return out;
  }
  // ---- Property set + Property Inspector layout ----
  // A plain variable goes out as `{name, metadata, value}` — there is no property bag
  // in that shape, and serializeValue emits the VALUE alone. So a Description set here
  // could only ever live until the file was read again. The prop stays declared (the
  // column and the inspector field exist for every row); what changes is that neither
  // offers an editor, and setProperty refuses it.
  get descriptionEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropValue, PropDataType, PropDescription];
  }
  getPILayout() {
    return [{ group: "General", items: [PropName, PropValue, PropDataType, PropKind, PropClass, PropDescription] }];
  }
  // ---- Edit + structural mutation (the only writers of the state above) ----
  // This is the section that makes the class one unit: it is the sole place that
  // reshapes a variable, and every reshape has to keep FOUR representations
  // agreed — _kind/_scalarType, _dims, _elements, and the child nodes — plus the
  // `serial` blob the JSON writer replays. Miss one and the symptom is silent data
  // loss, not a crash, which is what the long comments on the individual methods
  // are recording. The add/remove methods come in canX/xChildNode/execX triples:
  // the gate, the mutation, and the undo/redo wrapper the command stack calls.
  setProperty(propName2, stringValue) {
    if (propName2 === "Value") {
      if (this._isConstrainedChild()) {
        return this._setConstrainedValue(stringValue);
      }
      const parsed = MatlabValueParser_default.parse(stringValue);
      if (!parsed) {
        return {
          error: true,
          reason: "Invalid MATLAB expression",
          invalidValue: stringValue,
          validValue: this.displayValue
        };
      }
      this._applyParsed(parsed);
      this._markModified();
      this.parent?.childStructureChanged(this);
      return true;
    }
    return DataNode.prototype.setProperty.call(this, propName2, stringValue);
  }
  _isConstrainedChild() {
    if (!this.parent || !(this.parent instanceof _MatlabVariableNode)) {
      return false;
    }
    return this.parent._kind === "array" || this.parent._kind === "string";
  }
  // An element of a numeric or string array, whose container fixes what it may
  // hold: one MATLAB array is one class, so an element cannot be retyped the way a
  // free-standing variable can (setProperty's other path). Reached only when
  // _isConstrainedChild() is true, i.e. the parent's kind is 'array' or 'string' —
  // the two the branch below is exhaustive over, which is why it has no third arm.
  _setConstrainedValue(stringValue) {
    const parent = this.parent;
    if (parent._isOpaque) {
      return {
        error: true,
        reason: "This value is read-only",
        invalidValue: stringValue,
        validValue: this.displayValue
      };
    }
    const isArrayElement = parent._kind === "array";
    const isLogicalElement = isArrayElement && parent._scalarType === "logical";
    const parsed = MatlabValueParser_default.parse(stringValue);
    let accepted;
    if (isLogicalElement) {
      accepted = parsed?.type === "logical" || parsed?.type === "double" && (parsed.value === 0 || parsed.value === 1);
    } else if (isArrayElement) {
      accepted = parsed?.type === "double" && !Array.isArray(parsed.value);
    } else {
      accepted = parsed?.type === "char" && !parsed.dims || parsed?.type === "string";
    }
    if (!parsed || !accepted) {
      return {
        error: true,
        reason: isLogicalElement ? "Logical array elements must be true or false" : isArrayElement ? "Array elements must be scalar numbers" : "String elements must be character or string values",
        invalidValue: stringValue,
        validValue: this.displayValue
      };
    }
    this._scalarType = isArrayElement ? elementClass(parent._scalarType) : "string";
    this._scalarValue = isLogicalElement ? parsed.value ? 1 : 0 : isArrayElement ? exactForClass(parsed.value, this._scalarType) : parsed.value;
    if (!isArrayElement) {
      this._elements = [parsed.value];
    }
    parent._syncElementFromChild(this);
    parent._rawInput = void 0;
    this._markModified();
    return true;
  }
  // Every edit routes through _markModified (DataNode), so this is the one place
  // that catches all of them — value edits, renames, add/remove child, and the
  // schema-prop path. Invalidate the parsed-variable snapshot on this node and on
  // every MatlabVariableNode above it, because the save path reads `_var` from the
  // TOP-LEVEL variable: a struct field's edit has to make the STRUCT's snapshot
  // stale, not just the field's own. See the _var getter for why.
  _markModified() {
    let node = this;
    while (node instanceof _MatlabVariableNode) {
      node._varStale = true;
      node = node.parent;
    }
    super._markModified();
  }
  // Push an edited element's new value into this container's _elements slot.
  // _elements and the child nodes are two copies of the same data: the children
  // back the table rows, while _elements backs displayValue, the Value getter,
  // _var, and — once the array collapses back to a scalar or an element is
  // restored by undo — the value that survives. Leaving it stale silently
  // reverts the user's edit at that point.
  _syncElementFromChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0 && idx < this._elements.length) {
      this._elements[idx] = child._scalarValue;
    }
  }
  _applyParsed(parsed) {
    this.children = [];
    this._matVar = null;
    this._rawInput = void 0;
    const prevType = this._scalarType;
    if (parsed.type === "double" && Array.isArray(parsed.value) && parsed.value.length === 1) {
      this._kind = "scalar";
      this._scalarType = classAfterEdit(prevType, "double");
      this._scalarValue = exactForClass(parsed.value[0], this._scalarType);
      this._dims = [1, 1];
      this.serial = {};
    } else if (parsed.type === "double" && Array.isArray(parsed.value)) {
      this._kind = "array";
      this._scalarType = classAfterEdit(prevType, "double");
      this._elements = parsed.value.map((v) => exactForClass(v, this._scalarType));
      this._dims = parsed.dims;
      this._syncArraySerial();
      this._buildArrayChildren();
    } else if (parsed.type === "logical" && Array.isArray(parsed.value)) {
      this._scalarType = "logical";
      this._dims = parsed.dims;
      if (parsed.value.length === 1) {
        this._kind = "scalar";
        this._scalarValue = !!parsed.value[0];
        this._dims = [1, 1];
        this.serial = {};
      } else {
        this._kind = "array";
        this._elements = parsed.value;
        this._syncArraySerial();
        this._buildArrayChildren();
      }
    } else if (parsed.type === "string-array") {
      this._kind = "string";
      this._elements = parsed.value;
      this._dims = parsed.dims;
      this._scalarType = "string";
      this.serial = { _array_type: "String", _dimensions: parsed.dims };
      this._buildStringChildren();
    } else if (parsed.type === "cell") {
      this._kind = "cell";
      this._dims = parsed.dims;
      this._scalarType = "double";
      this.serial = { _dimensions: parsed.dims, _mw_element_type: "MATLABArray" };
      this._buildCellChildren(parsed.value);
    } else {
      this._kind = "scalar";
      this._scalarType = classAfterEdit(prevType, parsed.type);
      this._scalarValue = parsed.type === "double" ? exactForClass(parsed.value, this._scalarType) : parsed.value;
      this._dims = parsed.dims ? parsed.dims.slice() : [1, 1];
      this.serial = {};
    }
  }
  // The write-side twin of parseMatrixValue. This used to be its own loop, and it
  // spelled the body differently from BinarySlddParser's copy — newline-joined rows
  // rather than bracketed groups, and formatMatlabNum for every class rather than
  // MATLAB's typed literals. MATLAB reads the newline form as a 1x0 EMPTY matrix, so
  // editing any multi-row matrix in an uncompressed-text dictionary silently threw
  // the value away. Both writers now go through XmlUtils.formatMatrixSerial, which
  // carries the MATLAB evidence for each spelling.
  // `elements` is widened to admit a string because an int64/uint64 element is exact
  // decimal TEXT (parseTypedVector); formatNumLiteral, under formatMatrixSerial, carries
  // one through untouched and appends the class's own suffix.
  _buildMatrixString(dims, elements, type) {
    return formatMatrixSerial(elements, dims, type || this._scalarType || "double");
  }
  // THE ONLY PLACE AN ARRAY GROWS ONE CHILD PER ELEMENT. Every parse path — text,
  // binary, .mat, complex, typed vector, typed array — calls this instead of writing
  // its own loop. Six of them used to write their own, with the `length > 1` guard
  // spelled three times and missing three times; the comment at the .mat flat-array
  // site already said why ("every element builder states the rule the same way, so
  // none of them can drift out of step with the container again") but said it by
  // convention, which lasted exactly until there were two rules to agree on. The
  // second rule is the cap, and a cap honoured by five builders out of six is not a
  // cap at all.
  //
  // The two guards are the same shape and mean opposite things: a scalar has nothing
  // BELOW it to expand, an array past MAX_EXPANDED_ELEMENTS has too much. Both leave
  // `_elements` as the one copy of the value, which every reader here already falls
  // back to — see the cap's own note in DisplayConvention for why it has to be
  // all-or-nothing, and `_buildCellChildren` for why cells are exempt.
  //
  // `elementType` is for the one container whose elements are NOT of its own class:
  // a complex array stores `_scalarType` 'double' (that is what it serializes as)
  // while each element is a 'complex' scalar. Defaulting to elementClass(_scalarType)
  // keeps every other caller honest by silence.
  _buildArrayChildren(elementType) {
    const type = elementType || elementClass(this._scalarType);
    this._elementType = type;
    if (this._elements.length <= 1 || this._elements.length > MAX_EXPANDED_ELEMENTS) {
      return;
    }
    for (let i = 0; i < this._elements.length; i++) {
      const child = _MatlabVariableNode._createScalar(this._elements[i], type, String(i + 1), this);
      this.addChild(child);
    }
  }
  // One element of a string array, built as a string-KIND node rather than a
  // 'string'-typed scalar: the former serializes as a bare "" element, where
  // _createScalar('string') would produce a nested [""] array via
  // _serializeScalar. Shared by the parse, add, and undo paths so all three
  // build the identical shape — they used to construct it separately, and the
  // undo path's copy read the value back as if it were a scalar-kind child.
  _makeStringElement(name, value) {
    const child = new _MatlabVariableNode(name, this, { _dimensions: [1, 1] });
    child._kind = "string";
    child._elements = [value];
    child._dims = [1, 1];
    child._scalarValue = value;
    child._scalarType = "string";
    return child;
  }
  // Every string-array parse path calls this — the inline literal, the structured
  // `_array_type: 'String'` form, and the bare JSON list of strings. The latter two
  // used to build the identical child inline instead, which is how they came to be
  // the two element loops the cap did NOT reach: a 10,000-element string array from
  // either of them expanded in full while the same array written as a literal did
  // not. That is the shape of defect this choke point exists to make impossible, so
  // the lesson is the one _buildArrayChildren's note already records — a rule obeyed
  // by most of the paths is not a rule.
  _buildStringChildren() {
    if (this._elements.length <= 1 || this._elements.length > MAX_EXPANDED_ELEMENTS) {
      return;
    }
    for (let i = 0; i < this._elements.length; i++) {
      this.addChild(this._makeStringElement(String(i + 1), this._elements[i]));
    }
  }
  // NOT capped, unlike the two above, and this is the reason: a cell's children are
  // its ONLY copy. Its elements arrive as an argument and are never kept in
  // `_elements` — a cell element is a whole node, not a scalar — so there is nothing
  // to fall back to. `_serializeCellXml` says what the cap would cost here: with no
  // children it writes `Dimension="0*0"`, i.e. it would save the value away. A huge
  // cell is also far rarer than a huge numeric matrix, which is the shape that
  // actually arrives. Pinned by test/largeArrayNotExpanded.test.ts.
  _buildCellChildren(elements) {
    for (let i = 0; i < elements.length; i++) {
      const child = parseValue(elements[i], String(i + 1), this);
      this.addChild(child);
    }
  }
  canAddChild() {
    if (this._isOpaque) {
      return false;
    }
    if (this._kind === "scalar" && this._scalarType === "struct") {
      return true;
    }
    if (this._kind === "scalar") {
      return false;
    }
    if ((this._kind === "array" || this._kind === "cell" || this._kind === "string") && this._dims[0] > 1 && this._dims[1] > 1) {
      return false;
    }
    if (this._kind === "string" && this._dims[0] === 1 && this._dims[1] === 1) {
      return false;
    }
    return true;
  }
  addChildNode() {
    if (this._kind === "array" && this._elements.length === 0) {
      return this._convertToStructAndAddField();
    }
    if (this._kind === "scalar" && this._scalarType === "struct") {
      return this._addStructField();
    }
    if (this._kind === "array") {
      return this._addArrayChild();
    }
    if (this._kind === "cell") {
      return this._addCellChild();
    }
    if (this._kind === "string") {
      return this._addStringChild();
    }
    return null;
  }
  // Turn an untyped `[]` into an empty 1x1 struct. Kept separate from
  // _convertToStructAndAddField so execAddChild's redo can re-apply the
  // conversion around the ORIGINAL field node instead of a fresh one.
  _becomeStruct() {
    this._kind = "scalar";
    this._scalarType = "struct";
    this._scalarValue = null;
    this._elements = [];
    this._dims = [1, 1];
    this.children = [];
    this.serial = {};
  }
  _convertToStructAndAddField() {
    this._becomeStruct();
    const child = _MatlabVariableNode._createScalar(0, "double", "field", this);
    this.addChild(child);
    this._markModified();
    return child;
  }
  _addStructField() {
    const baseName = "field";
    const existing = new Set(this.children.map((c) => c.name));
    let uniqueName = baseName;
    let i = 1;
    while (existing.has(uniqueName)) {
      uniqueName = baseName + i;
      i++;
    }
    const child = _MatlabVariableNode._createScalar(0, "double", uniqueName, this);
    this.addChild(child);
    this._markModified();
    return child;
  }
  _addArrayChild() {
    const idx = this.children.length + 1;
    const child = _MatlabVariableNode._createScalar(0, elementClass(this._scalarType), String(idx), this);
    this.addChild(child);
    this._elements.push(0);
    this._updateDimsForCount(this._elements.length);
    this._syncArraySerial();
    this._markModified();
    return child;
  }
  _addCellChild() {
    const child = _MatlabVariableNode._createScalar(0, "double", String(this.children.length + 1), this);
    this.addChild(child);
    this._updateDimsForCount(this.children.length);
    if (this.serial._dimensions) {
      this.serial._dimensions = this._dims;
    }
    this._markModified();
    return child;
  }
  _addStringChild() {
    const child = this._makeStringElement(String(this.children.length + 1), "");
    this.addChild(child);
    this._elements.push("");
    this._updateDimsForCount(this._elements.length);
    this._markModified();
    return child;
  }
  canRemoveChild() {
    if (this._isOpaque) {
      return false;
    }
    if (this._kind === "scalar") {
      return false;
    }
    if ((this._kind === "array" || this._kind === "cell" || this._kind === "string") && this._dims[0] > 1 && this._dims[1] > 1) {
      return false;
    }
    return this.children.length > 0;
  }
  removeChildNode(child) {
    const idx = this.children.indexOf(child);
    if (idx < 0) {
      return;
    }
    this.removeChild(child);
    if (this._kind === "array") {
      this._elements.splice(idx, 1);
      this._updateArrayAfterRemove();
    } else if (this._kind === "cell") {
      this._updateCellAfterRemove();
    } else if (this._kind === "string") {
      this._elements.splice(idx, 1);
      this._updateStringAfterRemove();
    }
    this._reindexChildren();
    this._markModified();
  }
  _updateArrayAfterRemove() {
    if (this._elements.length <= 1) {
      if (this._elements.length === 1) {
        this._preCollapseDims = this._dims.slice();
        this._kind = "scalar";
        this._scalarValue = this._elements[0];
        this._dims = [1, 1];
        this._elements = [];
        this.children = [];
        this.serial = {};
      } else {
        this._dims = [1, 0];
        this.serial = this._elements;
      }
      return;
    }
    this._updateDimsForCount(this._elements.length);
    this._syncArraySerial();
  }
  _updateCellAfterRemove() {
    if (this.children.length === 0) {
      this._dims = [0, 0];
    } else {
      this._updateDimsForCount(this.children.length);
    }
    if (this.serial._dimensions) {
      this.serial._dimensions = this._dims;
    }
  }
  _updateStringAfterRemove() {
    if (this._elements.length <= 1) {
      if (this._elements.length === 1) {
        this._preCollapseDims = this._dims.slice();
        this._dims = [1, 1];
        this.children = [];
      } else {
        this._dims = [1, 0];
      }
      return;
    }
    this._updateDimsForCount(this._elements.length);
  }
  restoreChildNode(child, index) {
    if (this._kind === "scalar") {
      const survivor = _MatlabVariableNode._createScalar(this._scalarValue, elementClass(this._scalarType), "1", this);
      this._kind = "array";
      this._elements = [this._scalarValue];
      this._scalarValue = void 0;
      this._dims = this._preCollapseDims ?? [1, 1];
      this._preCollapseDims = null;
      this.children = [survivor];
    } else if (this._kind === "string" && this.children.length === 0 && this._elements.length === 1) {
      const survivor = this._makeStringElement("1", this._elements[0]);
      this._dims = this._preCollapseDims ?? [1, 1];
      this._preCollapseDims = null;
      this.children = [survivor];
    }
    this.children.splice(index, 0, child);
    child.parent = this;
    if (this._kind === "array") {
      const val = child._kind === "scalar" ? child._scalarValue : 0;
      this._elements.splice(index, 0, val);
      this._updateDimsForCount(this._elements.length);
      this._syncArraySerial();
    } else if (this._kind === "cell") {
      this._updateDimsForCount(this.children.length);
      if (this.serial._dimensions) {
        this.serial._dimensions = this._dims;
      }
    } else if (this._kind === "string") {
      const restored = child._scalarValue;
      this._elements.splice(index, 0, typeof restored === "string" ? restored : "");
      this._updateDimsForCount(this._elements.length);
    }
    this._reindexChildren();
    this._markModified();
  }
  execAddChild() {
    if (this._kind === "array" && this._elements.length === 0) {
      return this.canAddChild() ? this._addFirstStructField() : null;
    }
    return addChildUndoable(this);
  }
  // Add the first field to an empty `[]`, turning it into a 1x1 struct. Undo has to
  // put back the array shape the conversion discarded — removeChildNode/
  // restoreChildNode only move a child within a shape that already exists — and
  // redo has to re-apply the conversion around the SAME field node undo removed.
  // Calling _convertToStructAndAddField again minted a second 'field' instead, so
  // the undo stack's node reference went stale: a following undo removed a node
  // that was no longer in the tree, and each undo/redo cycle left one more orphan
  // field behind.
  _addFirstStructField() {
    const prevSerial = { ...this.serial };
    const child = this._convertToStructAndAddField();
    const self = this;
    return {
      node: child,
      undo() {
        self.removeChild(child);
        self._kind = "array";
        self._scalarType = "double";
        self._scalarValue = void 0;
        self._elements = [];
        self._dims = [0, 0];
        self.serial = prevSerial;
        self._markModified();
      },
      redo() {
        self._becomeStruct();
        self.addChild(child);
        self._markModified();
      }
    };
  }
  execRemoveChild(child) {
    return removeChildUndoable(this, child);
  }
  _updateDimsForCount(count) {
    if (this._dims[1] === 1) {
      this._dims = [count, 1];
    } else {
      this._dims = [1, count];
    }
  }
  // Re-render `serial` from the live _elements after the array's shape changed.
  // _serializeArray reads serial._type to decide whether to emit the typed literal,
  // so the tag is the ONLY carrier of the MATLAB class through the JSON writer:
  // hardcoding 'double' here — or dropping the tag entirely, which the bare
  // element-list form does — turned an int32/single/logical array into a double
  // array on the first add or remove. A matrix keeps the typed literal whatever its
  // class, because Matrix(r,c) has no bare JSON spelling at all.
  _syncArraySerial() {
    const typed = TYPED_NUMERIC_CLASS.test(this._scalarType) || this._scalarType === "logical";
    if (this._dims[0] > 1 || typed) {
      const serialType = typed ? this._scalarType : "double";
      this.serial = {
        _type: serialType,
        // The literal's own suffixes have to agree with the tag: MATLAB reads a
        // suffixless body as double whatever _type says.
        _value: this._buildMatrixString(this._dims, this._elements, serialType)
      };
    } else {
      this.serial = this._elements;
    }
  }
  _reindexChildren() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].name = String(i + 1);
    }
  }
  // ---- JSON serialization (the .sldd text format) ----
  // Round-trip fidelity first: an untouched value returns its captured `_rawInput`
  // verbatim rather than being re-rendered, so only edited values are rewritten.
  // The recurring hazard is that JSON has no literal for Inf/NaN — JSON.stringify
  // turns them into `null`, which reads back as 0 — so the branches that spot a
  // non-finite number fall back to the format's typed `{_type, _value}` escape
  // hatch, which spells them out as text.
  serializeValue() {
    if (this._rawInput !== void 0 && this.status !== "Modified" && !this._rawInput?._emptyDims) {
      return this._rawInput;
    }
    if (effectiveDims(this._dims).length > 2 || this._isComplexValue()) {
      const cdata = this._serializeCdata();
      if (cdata) {
        return cdata;
      }
    }
    switch (this._kind) {
      case "scalar":
        return this._serializeScalar();
      case "array":
        return this._serializeArray();
      case "cell":
        return this._serializeCell();
      case "string":
        return this._serializeString();
    }
  }
  /**
   * Is this a complex value? The two tests are the two shapes complexity arrives
   * in: a complex SCALAR carries `_scalarType === 'complex'`, while a complex ARRAY
   * is a plain `double` whose per-element values are the literal text `'1+2i'` —
   * the element nodes are the complex ones, not the parent. `_buildVarObject` has
   * always had to make the same distinction to set `isComplex`, and it asks here so
   * the projection and the serialization cannot disagree about what is complex; a
   * disagreement would mean writing a cdata stream built from a non-complex `_var`.
   */
  _isComplexValue() {
    if (this._scalarType === "complex") {
      return true;
    }
    if (this._kind !== "array") {
      return false;
    }
    const elems = this.children.length > 0 ? this.children.map(function(c) {
      return c._scalarValue;
    }) : this._elements;
    return elems.length > 0 && typeof elems[0] === "string" && String(elems[0]).includes("i");
  }
  // A value with no literal spelling — rank >= 3, or complex at any rank — as the
  // `{_type: 'cdata'}` byte stream MATLAB uses for it. `_var` is the same live-tree
  // rebuild the .mat and .slx writers use, so an edit anywhere below this node is
  // already in it (_markModified marks the whole chain stale).
  //
  // Returns null for a value MatWriter refuses — an MCOS opaque, a class it has no
  // MAT code for. Those have no stream spelling in this format at ALL, so the choice
  // is between the rank-2 form the branches below produce, which at least leaves a
  // readable file, and failing the whole save. It falls through.
  _serializeCdata() {
    try {
      return { _type: "cdata", _value: encodeCdata(this._var) };
    } catch (_e) {
      return null;
    }
  }
  _serializeScalar() {
    if (this._scalarType === "string") {
      return [this._scalarValue];
    }
    if (this._scalarType === "char") {
      const text = this._scalarValue === null || this._scalarValue === void 0 ? "" : String(this._scalarValue);
      const dims = this._textDims(text);
      if (text !== "" && charNeedsShape(dims)) {
        return { _type: "mxchar", _value: formatMxCharSerial(text, dims) };
      }
      return text;
    }
    if (this._scalarType === "struct") {
      return this._serializeStructValue();
    }
    if (this._scalarType === "complex") {
      return { _type: "cdata", _value: this._scalarValue };
    }
    if (needsTypedLiteral(this._scalarType, this._scalarValue)) {
      return { _type: this._scalarType, _value: formatNumLiteral(this._scalarValue, this._scalarType) };
    }
    return this._scalarValue;
  }
  _serializeArray() {
    if (this._elements.length === 0) {
      return [];
    }
    if (this.children.length === 0) {
      return this.serial;
    }
    const elems = this.children.map(function(c) {
      return c._scalarValue;
    });
    const serialType = this.serial?._type;
    if (serialType) {
      return {
        _type: serialType,
        _value: this._buildMatrixString(this._dims, elems, serialType)
      };
    }
    if (elems.some((v) => typeof v === "number" && !isFinite(v))) {
      return { _type: "double", _value: "[" + elems.map(formatMatlabNum).join(", ") + "]" };
    }
    const d = effectiveDims(this._dims);
    const typed = TYPED_NUMERIC_CLASS.test(this._scalarType) || this._scalarType === "logical";
    if (!typed && d.length <= 2 && (d[0] === 1 || d[1] === 1)) {
      return this.children.map(function(c) {
        return c.serializeValue();
      });
    }
    const matrixType = this._scalarType || "double";
    return { _type: matrixType, _value: this._buildMatrixString(d, elems, matrixType) };
  }
  // The `_array_type: 'Struct'` form, rebuilt from the tree. Deliberately the same
  // shape BinarySlddParser.structValue produces and a text .sldd carries in
  // _rawInput, so a struct read from a .mat and written to a dictionary
  // round-trips through the existing reader (NodeClassMap -> StructNode.parse)
  // unchanged.
  _serializeStructValue() {
    const dims = effectiveDims(this._dims);
    const elementNodes = elementCount(dims) > 1 ? this.children : [this];
    const fields = [];
    const elements = [];
    for (const el of elementNodes) {
      const bag = {};
      for (const child of el.children) {
        const c = child;
        bag[c.name] = c.serializeValue();
        if (!fields.includes(c.name)) {
          fields.push(c.name);
        }
      }
      elements.push(bag);
    }
    return {
      _array_type: "Struct",
      _dimensions: dims,
      _elements: elements,
      _fields: fields,
      _mw_element_type: "MATLABArray"
    };
  }
  _serializeCell() {
    const elements = this.children.map(function(child) {
      return child.serializeValue();
    });
    return {
      _array_type: "Cell",
      _dimensions: this._dims,
      _elements: elements,
      _mw_element_type: this.serial._mw_element_type || "MATLABArray"
    };
  }
  _serializeString() {
    if (this.parent && this.parent instanceof _MatlabVariableNode && this.parent._kind === "string") {
      return this._elements[0];
    }
    const elements = this.children.length > 0 ? this.children.map(function(c) {
      return c.serializeValue();
    }) : this._elements;
    if (this.serial._array_type) {
      return {
        _array_type: "String",
        _dimensions: this._dims,
        _elements: elements,
        _mw_element_type: this.serial._mw_element_type || "MATLABArray"
      };
    }
    return elements;
  }
  // ---- XML serialization (the .slx workspace format) ----
  // A parallel set of per-kind writers rather than a reuse of the JSON ones,
  // because the two formats disagree on essentials: XML is explicitly typed by a
  // Class= attribute, carries dimensions as "rows*cols", and — the reason these
  // can't share the JSON traversal — stores matrix elements in COLUMN-major order,
  // hence transposeToColumnMajorND on the way out.
  serializeXml(tagName, attrs, indent) {
    switch (this._kind) {
      case "scalar":
        return this._serializeScalarXml(tagName, attrs, indent);
      case "array":
        return this._serializeArrayXml(tagName, attrs, indent);
      case "cell":
        return this._serializeCellXml(tagName, attrs, indent);
      case "string":
        return this._serializeStringXml(tagName, attrs, indent);
    }
  }
  _serializeScalarXml(tagName, attrs, indent) {
    const p = pad(indent);
    const type = this._scalarType;
    const val = this._scalarValue;
    let attrStr = "";
    if (attrs && attrs.Name) {
      attrStr += ' Name="' + escapeXml(attrs.Name) + '"';
    }
    if (type === "string") {
      this._kind = "string";
      this._elements = [val];
      this._dims = [1, 1];
      const result = this._serializeStringXml(tagName, attrs, indent);
      this._kind = "scalar";
      return result;
    }
    if (type === "struct") {
      const bag = this._serializeStructValue();
      return parseValue(bag, this.name, null).serializeXml(tagName, attrs, indent);
    }
    if (type === "char") {
      if (val === "" || val === null || val === void 0) {
        return p + "<" + tagName + attrStr + ' Class="char"/>';
      }
      const text = String(val);
      const dims = this._textDims(text);
      const dimAttr = charNeedsShape(dims) ? ' Dimension="' + dims.join("*") + '"' : "";
      return p + "<" + tagName + attrStr + ' Class="char"' + dimAttr + ">" + escapeXml(text) + "</" + tagName + ">";
    }
    if (type === "logical") {
      return p + "<" + tagName + attrStr + ' Class="logical">' + (val ? "1" : "0") + "</" + tagName + ">";
    }
    if (type === "complex") {
      return p + "<" + tagName + attrStr + ' Class="double" IsComplex="1">' + formatComplexXml(String(val)) + "</" + tagName + ">";
    }
    if (type === "double") {
      return p + "<" + tagName + attrStr + ' Class="double">' + formatDoubleXml(val) + "</" + tagName + ">";
    }
    return p + "<" + tagName + attrStr + ' Class="' + type + '">' + formatNumericXml(val, type) + "</" + tagName + ">";
  }
  _serializeArrayXml(tagName, attrs, indent) {
    const p = pad(indent);
    const type = this._scalarType;
    const dims = this._dims;
    const rows = dims[0];
    const cols = dims[1];
    const dimAttr = dims.join("*");
    let attrStr = "";
    if (attrs && attrs.Name) {
      attrStr += ' Name="' + escapeXml(attrs.Name) + '"';
    }
    if (rows === 0 || cols === 0 || this._elements.length === 0 && this.children.length === 0) {
      return p + "<" + tagName + attrStr + ' Class="' + (type || "double") + '" Dimension="' + dimAttr + '"/>';
    }
    const elems = this.children.length > 0 ? this.children.map(function(c) {
      return c._scalarValue;
    }) : this._elements;
    if (type === "complex" || elems.length > 0 && typeof elems[0] === "string" && elems[0].includes("i")) {
      const colMajor2 = transposeToColumnMajorND(elems, dims);
      const formatted2 = colMajor2.map(function(v) {
        return formatComplexXml(String(v));
      });
      return p + "<" + tagName + attrStr + ' Class="double" IsComplex="1" Dimension="' + dimAttr + '">' + formatted2.join(" ") + "</" + tagName + ">";
    }
    const colMajor = transposeToColumnMajorND(elems, dims);
    const formatted = colMajor.map(function(v) {
      return formatNumericXml(v, type || "double");
    });
    const classAttr = type === "logical" ? "logical" : type || "double";
    return p + "<" + tagName + attrStr + ' Class="' + classAttr + '" Dimension="' + dimAttr + '">' + formatted.join(" ") + "</" + tagName + ">";
  }
  _serializeCellXml(tagName, attrs, indent) {
    const p = pad(indent);
    const dims = this._dims;
    let attrStr = "";
    if (attrs && attrs.Name) {
      attrStr += ' Name="' + escapeXml(attrs.Name) + '"';
    }
    if (this.children.length === 0) {
      return p + "<" + tagName + attrStr + ' Class="cell" Dimension="0*0"/>';
    }
    let xml = p + "<" + tagName + attrStr + ' Class="cell" Dimension="' + dims.join("*") + '">\n';
    for (const child of this.children) {
      xml += child.serializeXml("Element", {}, indent + 1) + "\n";
    }
    xml += p + "</" + tagName + ">";
    return xml;
  }
  _serializeStringXml(tagName, attrs, indent) {
    const p = pad(indent);
    const elements = this.children.length > 0 ? this.children.map(function(c) {
      return c._elements ? c._elements[0] : c._scalarValue;
    }) : this._elements;
    let attrStr = "";
    if (attrs && attrs.Name) {
      attrStr += ' Name="' + escapeXml(attrs.Name) + '"';
    }
    return p + "<" + tagName + attrStr + ">\n" + DataNode._stringEnvelopeXml(elements, this._dims, indent) + p + "</" + tagName + ">";
  }
  // ---- Binary rebuild: the MatVariable the .mat/.slx save path writes ----
  //
  // The MatVariable the save path writes (MatNode.getVariables, and the .slx
  // workspace splice in ModelNode.serialize).
  //
  // `_matVar` is the variable exactly as the parser read it, kept so an untouched
  // variable round-trips byte-for-byte through its `_rawBytes`. But it is a
  // SNAPSHOT: editing a CHILD of this node — an array element, a struct field, a
  // cell entry — mutates the child nodes, not this object, so returning the
  // snapshot wrote the ORIGINAL value back and silently discarded the edit. Only
  // a whole-variable `setProperty('Value', …)` escaped it, because _applyParsed
  // clears the cache; that made the bug look shape-dependent rather than what it
  // is, an edit-depth one.
  //
  // A numeric array happened to survive because `_elements` is the very array
  // `_matVar.value` points at, so element edits landed in both — an aliasing
  // accident, not a design. Struct fields and cell entries hold child NODES and
  // had no such alias, so their edits were lost outright.
  //
  // So once anything below this node changes, the snapshot is no longer the truth
  // and we rebuild from the live tree. `_rawBytes` stays on the rebuilt variable
  // for the parts of the write path that still replay bytes for untouched values.
  get _var() {
    if (this._matVar && !this._varStale) {
      return this._matVar;
    }
    return this._buildVarObject();
  }
  _buildVarObject() {
    const matClassName = this._scalarType === "logical" ? "uint8" : this._scalarType;
    const v = {
      name: this.name,
      className: this._isOpaque ? this._opaqueClassName : matClassName,
      dimensions: this._dims.slice(),
      isComplex: false,
      isLogical: this._scalarType === "logical",
      value: null,
      fields: null,
      _rawBytes: this._rawBytes,
      _modified: this.status === "Modified"
    };
    if (this._isOpaque) {
      v.isOpaque = true;
      v.dimensions = [1, 1];
      return v;
    }
    if (this._scalarType === "struct") {
      v.className = "struct";
      const fields = {};
      if (elementCount(this._dims) > 1) {
        const fieldNames = [];
        for (const elem of this.children) {
          for (const f of elem.children) {
            if (fieldNames.indexOf(f.name) < 0) {
              fieldNames.push(f.name);
            }
          }
        }
        for (const fname of fieldNames) {
          fields[fname] = this.children.map(function(elem) {
            const f = elem.children.find(function(c) {
              return c.name === fname;
            });
            return f ? f._var : emptyDouble();
          });
        }
      } else {
        for (const child of this.children) {
          fields[child.name] = child._var;
        }
      }
      v.fields = fields;
    } else if (this._kind === "scalar") {
      v.value = this._scalarValue;
      if (this._scalarType === "char") {
        v.className = "char";
        v.dimensions = this._textDims(typeof this._scalarValue === "string" ? this._scalarValue : "");
      }
      if (this._scalarType === "complex") {
        v.className = "double";
        v.isComplex = true;
        const m = String(this._scalarValue).match(/^([-\d.eE+]+)([+-][\d.eE+]+)i$/);
        if (m) {
          v.value = [{ re: parseFloat(m[1]), im: parseFloat(m[2]) }];
        }
      }
    } else if (this._kind === "array") {
      const elems = this.children.length > 0 ? this.children.map(function(c) {
        return c._scalarValue;
      }) : this._elements;
      if (this._isComplexValue()) {
        v.className = "double";
        v.isComplex = true;
        v.value = elems.map(function(s) {
          const m = String(s).match(/^([-\d.eE+]+)([+-][\d.eE+]+)i$/);
          return m ? { re: parseFloat(m[1]), im: parseFloat(m[2]) } : { re: 0, im: 0 };
        });
      } else {
        v.value = elems.length === 1 ? elems[0] : elems;
      }
    } else if (this._kind === "cell") {
      v.className = "cell";
      v.value = this.children.map(function(c) {
        return c._var;
      });
    } else if (this._kind === "string") {
      v.className = "char";
      const str = this._elements.length === 1 ? this._elements[0] : this._elements.join("");
      v.value = str;
      v.dimensions = [1, str.length];
    }
    return v;
  }
  // ---- Static factories: binary MatVariable -> node ----
  // The entry point is parseMatVariable, which dispatches on the parsed
  // className; the _createFromMat* helpers below are its per-class arms. All of
  // them keep the source `variable` on _matVar and its bytes on _rawBytes, which
  // is what lets an untouched variable round-trip byte-for-byte (see the _var
  // getter). These are statics rather than constructor overloads because the shape
  // isn't known until the value has been inspected.
  static parseMatVariable(variable, name, parent) {
    if (variable.isOpaque) {
      return _MatlabVariableNode._createOpaque(variable, name, parent);
    }
    if (variable.undecoded) {
      return _MatlabVariableNode._createUndecoded(variable, name, parent);
    }
    if (variable.className === "struct") {
      return _MatlabVariableNode._createFromMatStruct(variable, name, parent);
    }
    if (variable.className === "cell") {
      return _MatlabVariableNode._createFromMatCell(variable, name, parent);
    }
    if (variable.className === "char") {
      return _MatlabVariableNode._createFromMatChar(variable, name, parent);
    }
    return _MatlabVariableNode._createFromMatNumeric(variable, name, parent);
  }
  static _createOpaque(variable, name, parent) {
    const node = new _MatlabVariableNode(name, parent, {});
    node._isOpaque = true;
    node._opaqueClassName = variable.className;
    node._rawBytes = variable._rawBytes || null;
    node._matVar = variable;
    return node;
  }
  // A recorded-but-not-decoded variable: one row, the parser's placeholder as its
  // whole value, no children, and no editor (the placeholder is angle-bracketed, which
  // is what BaseNode.valueEditable withholds the editor for). `_scalarType` is the
  // parser's class name, so the DataType column still says what the FILE says the
  // variable is — 'object' or 'sparse' — which is the part that was read.
  static _createUndecoded(variable, name, parent) {
    const node = new _MatlabVariableNode(name, parent, {});
    node._rawBytes = variable._rawBytes || null;
    node._matVar = variable;
    node._kind = "scalar";
    node._scalarType = variable.className;
    node._scalarValue = variable.value;
    node._dims = variable.dimensions.slice();
    return node;
  }
  static createFromMcosDecoded(variable, decoded, parent) {
    const node = new _MatlabVariableNode(variable.name, parent, {});
    node._isOpaque = true;
    node._opaqueClassName = variable.className;
    node._rawBytes = variable._rawBytes || null;
    node._matVar = variable;
    node._mcosProperties = decoded.properties;
    node._mcosValue = decoded.value;
    node._mcosDimensions = decoded.dimensions;
    if (decoded.stringElements) {
      node._adoptStringPayload(decoded.dimensions, decoded.stringElements);
    }
    return node;
  }
  // Give a decoded `string` the state a string array carries on every other path, so one
  // formatter, one child-label rule and one serializer cover all four formats. STAYS
  // OPAQUE: `_isOpaque` is what withholds the editor and the add/remove-child actions, and
  // what keeps `_var` handing back the variable's own bytes verbatim on save. Nothing in
  // this package writes a .mat MCOS subsystem, so a writable string here would be a value
  // typed into a node whose bytes go out unchanged — silent data loss, not an edit.
  _adoptStringPayload(dims, elements) {
    this._kind = "string";
    this._scalarType = "string";
    this._elements = elements.slice();
    this._dims = dims.slice();
    this.serial = {
      _array_type: "String",
      _dimensions: dims.slice(),
      _mw_element_type: "MATLABArray"
    };
    this._buildStringChildren();
  }
  static _createFromMatNumeric(variable, name, parent) {
    const node = new _MatlabVariableNode(name, parent, {});
    node._rawBytes = variable._rawBytes || null;
    node._matVar = variable;
    const dims = variable.dimensions;
    const totalElements = dims.reduce((a, b) => a * b, 1);
    if (variable.isComplex) {
      const arr = Array.isArray(variable.value) ? variable.value : [variable.value];
      if (arr.length === 1) {
        node._kind = "scalar";
        node._scalarType = "complex";
        const c = arr[0];
        node._scalarValue = c.im >= 0 ? c.re + "+" + c.im + "i" : c.re + "" + c.im + "i";
        node._dims = [1, 1];
      } else {
        node._kind = "array";
        node._scalarType = variable.className;
        node._dims = dims.slice();
        node._elements = arr.map(function(c) {
          return c.im >= 0 ? c.re + "+" + c.im + "i" : c.re + "" + c.im + "i";
        });
        node._buildArrayChildren("complex");
      }
      return node;
    }
    if (totalElements === 0) {
      node._kind = "array";
      node._scalarType = variable.className;
      node._dims = dims.slice();
      node._elements = [];
      return node;
    }
    if (totalElements === 1) {
      node._kind = "scalar";
      node._scalarType = variable.isLogical ? "logical" : variable.className;
      node._scalarValue = variable.isLogical ? !!variable.value : variable.value;
      node._dims = [1, 1];
      return node;
    }
    node._kind = "array";
    node._scalarType = variable.isLogical ? "logical" : variable.className;
    node._dims = dims.slice();
    const values = Array.isArray(variable.value) ? variable.value : [variable.value];
    node._elements = variable.isLogical ? values.map(function(v) {
      return v ? 1 : 0;
    }) : values;
    node._buildArrayChildren();
    return node;
  }
  static _createFromMatChar(variable, name, parent) {
    const node = new _MatlabVariableNode(name, parent, {});
    node._rawBytes = variable._rawBytes || null;
    node._matVar = variable;
    node._kind = "scalar";
    node._scalarType = "char";
    node._scalarValue = variable.value || "";
    node._dims = variable.dimensions.slice();
    return node;
  }
  static _createFromMatStruct(variable, name, parent) {
    const node = new _MatlabVariableNode(name, parent, {});
    node._rawBytes = variable._rawBytes || null;
    node._matVar = variable;
    node._kind = "scalar";
    node._scalarType = "struct";
    node._scalarValue = null;
    node._dims = variable.dimensions.slice();
    if (!variable.fields) {
      return node;
    }
    const fieldNames = Object.keys(variable.fields);
    const count = elementCount(node._dims);
    if (count <= 1) {
      for (const fieldName of fieldNames) {
        const fieldVar = variable.fields[fieldName];
        const childVar = Array.isArray(fieldVar) ? fieldVar[0] : fieldVar;
        if (childVar) {
          node.addChild(_MatlabVariableNode.parseMatVariable(childVar, fieldName, node));
        }
      }
      return node;
    }
    for (let ei = 0; ei < count; ei++) {
      const elemNode = new _MatlabVariableNode(String(ei + 1), node, {});
      elemNode._kind = "scalar";
      elemNode._scalarType = "struct";
      elemNode._scalarValue = null;
      elemNode._dims = [1, 1];
      elemNode._subscript = { index: ei, dims: node._dims, order: "column-major", bracket: "()" };
      for (const fieldName of fieldNames) {
        const fieldVar = variable.fields[fieldName];
        const childVar = Array.isArray(fieldVar) ? fieldVar[ei] : fieldVar;
        if (childVar) {
          elemNode.addChild(_MatlabVariableNode.parseMatVariable(childVar, fieldName, elemNode));
        }
      }
      node.addChild(elemNode);
    }
    return node;
  }
  static _createFromMatCell(variable, name, parent) {
    const node = new _MatlabVariableNode(name, parent, {});
    node._rawBytes = variable._rawBytes || null;
    node._matVar = variable;
    node._kind = "cell";
    node._scalarType = "double";
    node._dims = variable.dimensions.slice();
    const cells = Array.isArray(variable.value) ? variable.value : [];
    cells.forEach(function(cell, i) {
      const child = _MatlabVariableNode.parseMatVariable(cell ?? emptyDouble(), String(i + 1), node);
      node.addChild(child);
    });
    return node;
  }
  // ---- Static factories: JSON value -> node ----
  // `parse` is the single entry point (NodeClassMap routes to it) and the rest are
  // its arms, one per on-disk spelling of a value: the typed {_type,_value}
  // literals, cdata (both the bit-packed and the plain-text complex forms), the
  // structured {_array_type} containers, and the bare JSON scalar/array. They are
  // separate named statics rather than one long switch mainly so the .sldd tests
  // can drive an individual spelling directly. Each stashes the untouched input on
  // `_rawInput` so serializeValue can replay it verbatim.
  static get defaultName() {
    return "Var";
  }
  static createDefault(name, parent) {
    return _MatlabVariableNode._createScalar(0, "double", name, parent);
  }
  static _createScalar(value, type, name, parent) {
    const node = new _MatlabVariableNode(name, parent, {});
    node._kind = "scalar";
    node._scalarValue = value;
    node._scalarType = type;
    node._dims = [1, 1];
    return node;
  }
  static parse(rawVal, name, parent) {
    if (rawVal && typeof rawVal === "object" && rawVal._type && rawVal._emptyDims) {
      const rv = rawVal;
      const node = new _MatlabVariableNode(name, parent, rv);
      node._rawInput = rv;
      node._kind = "array";
      node._elements = [];
      node._dims = rv._emptyDims;
      node._scalarType = rv._type;
      return node;
    }
    if (rawVal && typeof rawVal === "object" && rawVal._type && rawVal._value !== void 0 && typeof rawVal._value === "string") {
      const rv = rawVal;
      if (rv._type === "mxchar") {
        return _MatlabVariableNode.parseMxChar(rv, name, parent);
      }
      if (rv._type === "struct" && /^\[\s*\]$/.test(rv._value)) {
        return _MatlabVariableNode.parseEmptyStruct(rv, name, parent);
      }
      if (rv._value.indexOf("Matrix(") === 0) {
        return _MatlabVariableNode.parseTypedArray(rv, name, parent);
      }
      if (rv._value.charAt(0) === "[") {
        return _MatlabVariableNode.parseTypedVector(rv, name, parent);
      }
      return _MatlabVariableNode.parseTypedScalar(rv, name, parent);
    }
    if (rawVal && typeof rawVal === "object" && rawVal._array_type === "Cell") {
      return _MatlabVariableNode.parseCell(rawVal, name, parent);
    }
    if (rawVal && typeof rawVal === "object" && rawVal._array_type === "String") {
      return _MatlabVariableNode.parseStructuredString(rawVal, name, parent);
    }
    if (Array.isArray(rawVal) && rawVal.length > 0 && rawVal.every(function(el) {
      return typeof el === "string";
    })) {
      return _MatlabVariableNode.parsePlainStringArray(rawVal, name, parent);
    }
    if (Array.isArray(rawVal)) {
      return _MatlabVariableNode.parseFlatArray(rawVal, name, parent);
    }
    return _MatlabVariableNode.parseScalar(rawVal, name, parent);
  }
  static parseScalar(rawVal, name, parent) {
    const node = new _MatlabVariableNode(name, parent, {});
    node._rawInput = rawVal;
    node._kind = "scalar";
    node._scalarValue = rawVal;
    node._dims = [1, 1];
    if (typeof rawVal === "boolean") {
      node._scalarType = "logical";
    } else if (typeof rawVal === "number") {
      node._scalarType = "double";
    } else if (typeof rawVal === "string") {
      node._scalarType = "char";
    } else {
      node._scalarType = "double";
      node._scalarValue = rawVal === null || rawVal === void 0 ? 0 : rawVal;
    }
    return node;
  }
  /**
   * struct([]) out of a text dictionary. Deliberately the same node
   * `_createFromMatStruct` builds for the same value — scalar kind, 'struct' class,
   * a null scalar value and the real extents — so `<0x0 struct>` is what all four
   * channels show and `displayValue`'s struct arm needs no empty case of its own.
   */
  static parseEmptyStruct(rawVal, name, parent) {
    const node = new _MatlabVariableNode(name, parent, rawVal);
    node._rawInput = rawVal;
    node._kind = "scalar";
    node._scalarType = "struct";
    node._scalarValue = null;
    node._dims = [0, 0];
    return node;
  }
  static parseTypedScalar(rawVal, name, parent) {
    if (rawVal._type === "cdata") {
      return _MatlabVariableNode.parseCdata(rawVal, name, parent);
    }
    const node = new _MatlabVariableNode(name, parent, rawVal);
    node._rawInput = rawVal;
    node._kind = "scalar";
    node._dims = [1, 1];
    node._scalarType = rawVal._type;
    const bare = rawVal._value.replace(/[FU]$/, "");
    if (rawVal._type === "logical") {
      node._scalarValue = bare === "1" || bare === "true";
    } else if (needsExactInt(node._scalarType)) {
      node._scalarValue = parseExactNum(bare);
    } else {
      node._scalarValue = parseMatlabNum(bare);
    }
    return node;
  }
  static parseCdata(rawVal, name, parent) {
    const valStr = rawVal._value;
    if (/^[\d.eE+\-i\s]+$/.test(valStr)) {
      return _MatlabVariableNode._parseCdataText(rawVal, name, parent);
    }
    try {
      const bytes = uudecode(valStr);
      const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const tagType = dv.getUint32(8, true);
      const tagSize = dv.getUint32(12, true);
      if (tagType !== MI_MATRIX4) {
        throw new Error("cdata is not a MAT matrix element");
      }
      const variable = parseMatrix(dv, 16, tagSize);
      const node = _MatlabVariableNode.parseMatVariable(variable, name, parent);
      node._rawInput = rawVal;
      return node;
    } catch (_e) {
      const node = new _MatlabVariableNode(name, parent, rawVal);
      node._rawInput = rawVal;
      node._kind = "scalar";
      node._dims = [1, 1];
      node._scalarType = "char";
      node._scalarValue = valStr;
      return node;
    }
  }
  static _parseCdataText(rawVal, name, parent) {
    const colMajorParts = rawVal._value.trim().split(/\s+/).map(function(s) {
      return s.replace(/(\d+)\.0(?=[+\-i]|$)/g, "$1");
    });
    if (colMajorParts.length === 1) {
      const node2 = new _MatlabVariableNode(name, parent, rawVal);
      node2._rawInput = rawVal;
      node2._kind = "scalar";
      node2._dims = [1, 1];
      node2._scalarType = "complex";
      node2._scalarValue = colMajorParts[0];
      return node2;
    }
    const dims = effectiveDims(rawVal._dimensions || [1, colMajorParts.length]);
    const parts = transposeFromColumnMajorND(colMajorParts, dims);
    const node = new _MatlabVariableNode(name, parent, rawVal);
    node._rawInput = rawVal;
    node._kind = "array";
    node._scalarType = "double";
    node._dims = dims;
    node._elements = parts;
    node._buildArrayChildren("complex");
    return node;
  }
  static parseTypedVector(rawVal, name, parent) {
    const node = new _MatlabVariableNode(name, parent, rawVal);
    node._rawInput = rawVal;
    node._kind = "array";
    node._scalarType = rawVal._type;
    const inner = rawVal._value.replace(/^\[/, "").replace(/\]$/, "");
    const parts = inner.split(",").map(function(s) {
      return s.trim().replace(/[FU]$/, "");
    });
    if (rawVal._type === "logical") {
      node._elements = parts.map(function(s) {
        return s === "1" || s === "true" ? 1 : 0;
      });
    } else if (needsExactInt(node._scalarType)) {
      node._elements = parts.map(parseExactNum);
    } else {
      node._elements = parts.map(parseMatlabNum);
    }
    node._dims = [1, node._elements.length];
    node._buildArrayChildren();
    return node;
  }
  /**
   * MATLAB's `mxchar` literal: a char array of rank >= 2, spelled as character CODES
   * under a `Matrix(r,c)` header with one bracketed group per ROW.
   *
   * It becomes the same node a .mat or a binary dictionary produces for the same value
   * — one char-KIND scalar holding the whole text in MATLAB's column-major storage
   * order, with the real extents on _dims. So `['ab'; 'cd']` reads identically out of
   * all three channels, and the writers (_serializeScalar, _serializeScalarXml,
   * _buildVarObject) each spell it their own way from that single representation.
   *
   * Read as a numeric array instead — which is what the Matrix() dispatch did before
   * this arm existed — the value came back as a 2x2 of 97/98/99/100 with dataType
   * 'mxchar', displayed `[97 98; 99 100]`, and had no char anything about it.
   */
  static parseMxChar(rawVal, name, parent) {
    const node = new _MatlabVariableNode(name, parent, rawVal);
    node._rawInput = rawVal;
    node._kind = "scalar";
    node._scalarType = "char";
    const parsed = parseMatrixValue(rawVal);
    if (!parsed) {
      const text = String(rawVal._value ?? "");
      node._scalarValue = text;
      node._dims = [1, text.length];
      return node;
    }
    node._dims = parsed.dims.slice();
    node._scalarValue = charTextFromCodes(parsed.elements.map(Number), parsed.dims);
    return node;
  }
  static parseFlatArray(rawVal, name, parent) {
    const node = new _MatlabVariableNode(name, parent, rawVal);
    node._rawInput = rawVal;
    node._kind = "array";
    node._elements = rawVal;
    node._dims = rawVal.length === 0 ? [0, 0] : [1, rawVal.length];
    node._scalarType = "double";
    node._buildArrayChildren();
    return node;
  }
  static parseTypedArray(rawVal, name, parent) {
    const parsed = parseMatrixValue(rawVal);
    if (!parsed) {
      const node2 = new _MatlabVariableNode(name, parent, rawVal);
      node2._rawInput = rawVal;
      node2._kind = "array";
      node2._elements = [];
      node2._dims = [0, 0];
      node2._scalarType = rawVal._type;
      return node2;
    }
    const node = new _MatlabVariableNode(name, parent, rawVal);
    node._rawInput = rawVal;
    node._kind = "array";
    node._elements = parsed.elements;
    node._dims = parsed.dims.slice();
    node._scalarType = parsed.type;
    node._buildArrayChildren();
    return node;
  }
  static parseCell(rawVal, name, parent) {
    const serial = {
      _dimensions: rawVal._dimensions,
      _mw_element_type: rawVal._mw_element_type
    };
    const node = new _MatlabVariableNode(name, parent, serial);
    node._rawInput = rawVal;
    node._kind = "cell";
    node._dims = rawVal._dimensions || [1, 1];
    if (rawVal._elements && rawVal._elements.length > 0) {
      node._buildCellChildren(rawVal._elements);
    }
    return node;
  }
  static parseStructuredString(rawVal, name, parent) {
    const serial = {
      _array_type: rawVal._array_type,
      _dimensions: rawVal._dimensions,
      _mw_element_type: rawVal._mw_element_type
    };
    const node = new _MatlabVariableNode(name, parent, serial);
    node._rawInput = rawVal;
    node._kind = "string";
    node._elements = rawVal._elements || [];
    node._dims = rawVal._dimensions || [1, node._elements.length];
    node._scalarType = "string";
    node._buildStringChildren();
    return node;
  }
  static parsePlainStringArray(rawVal, name, parent) {
    const serial = { _dimensions: [1, rawVal.length] };
    const node = new _MatlabVariableNode(name, parent, serial);
    node._rawInput = rawVal;
    node._kind = "string";
    node._elements = rawVal;
    node._dims = [1, rawVal.length];
    node._scalarType = "string";
    node._buildStringChildren();
    return node;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ConstantNode.js
var ConstantNode = class _ConstantNode extends MatlabVariableNode {
  // A Constant is always a Constant — its Kind never follows the section/derived
  // logic MatlabVariableNode uses (that logic is what turns a plain variable INTO
  // a Constant in the first place).
  get kind() {
    return "Constant";
  }
  get icon() {
    return "typeConstant";
  }
  // A Constant is a scalar leaf: no children, ever.
  canAddChild() {
    return false;
  }
  // A well-formed Constant is scalar-numeric and editable. Defensive: if a file on
  // disk carries a derived entry whose value is NOT scalar-numeric (invalid in
  // MATLAB, but possible in a hand-edited .sldd), render it read-only rather than
  // let it be edited into a still-invalid state.
  get valueEditable() {
    if (!this.isScalarNumeric) {
      return false;
    }
    return super.valueEditable;
  }
  setProperty(propName2, stringValue) {
    if (propName2 === "Value") {
      const parsed = MatlabValueParser_default.parse(stringValue);
      if (!parsed) {
        return {
          error: true,
          reason: "Invalid MATLAB expression",
          invalidValue: stringValue,
          validValue: this.displayValue
        };
      }
      if (!parsedIsScalarNumeric(parsed)) {
        return {
          error: true,
          reason: `The value for constant '${this.name}' must be scalar and numeric.`,
          invalidValue: stringValue,
          validValue: this.displayValue
        };
      }
      return super.setProperty(propName2, stringValue);
    }
    return DataNode.prototype.setProperty.call(this, propName2, stringValue);
  }
  static get defaultName() {
    return "Const";
  }
  static createDefault(name, parent) {
    return _ConstantNode.fromVariable(MatlabVariableNode.createDefault(name, parent));
  }
  static parse(rawVal, name, parent) {
    return _ConstantNode.fromVariable(MatlabVariableNode.parse(rawVal, name, parent));
  }
  // Reclass an already-parsed plain MATLAB variable AS a Constant, in place. A
  // ConstantNode adds no instance state over MatlabVariableNode — it only
  // overrides behavior — so swapping the prototype specializes the node while
  // preserving its identity, children, parent pointers, metadata, and serial
  // state. This is what SectionNode uses to turn a derived variable into a
  // Constant without a fragile field-by-field copy.
  static fromVariable(node) {
    Object.setPrototypeOf(node, _ConstantNode.prototype);
    return node;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/StructNode.js
function fieldsOf(rawVal) {
  if (Array.isArray(rawVal._fields)) {
    return rawVal._fields;
  }
  const elements = rawVal._elements;
  if (Array.isArray(elements) && elements.length > 0 && elements[0]) {
    return Object.keys(elements[0]);
  }
  return [];
}
var StructNode = class _StructNode extends DataNode {
  constructor() {
    super(...arguments);
    this._fieldsDeclared = false;
  }
  get icon() {
    return "wsTree";
  }
  get className() {
    return "struct";
  }
  // 'struct' is a real data type, so it belongs in the DataType column.
  get dataType() {
    return this.className;
  }
  // A struct is a MATLAB variable, like scalars/arrays/cells.
  get kind() {
    return "MATLAB Variable";
  }
  get displayValue() {
    return summaryForm(this.dims, "struct");
  }
  // Every extent a MATLAB struct array declares, normalized the way MATLAB's own
  // size() reports it. Read this rather than serial._dimensions[0]/[1]: MATLAB
  // writes a 1x1x3 struct array as Dimension="1*1*3" and a 2x3x2 as "2*3*2", so a
  // rank-2 reading of either one contradicts the element list underneath it.
  //
  // Public, and named like MatlabVariableNode.dims, because the shape is DATA: it
  // was reachable only inside displayValue, so a consumer that wanted MATLAB's
  // size() had to parse the display string it was also checking.
  get dims() {
    return effectiveDims(this.serial._dimensions);
  }
  // How many <Element>s the array has — the product of EVERY extent. d[0]*d[1]
  // said 6 for a 2x3x2 (which then wrote Dimension="2*3" over twelve elements and
  // segfaulted MATLAB's XML reader) and 1 for a 1x1x3 (which wrapped the three
  // elements in one bogus outer <Element> and, on the serializeValue path, threw
  // their contents away).
  get _numElements() {
    return elementCount(this.dims);
  }
  // A struct array's children are its ELEMENTS; only a scalar struct's children
  // are its fields. Anything that edits or reads fields has to ask this and not
  // `d[0] === 1 && d[1] === 1`, which is true of a 1x1x3 array as well.
  get _isScalarStruct() {
    return this._numElements === 1;
  }
  // A struct serializes as its fields and nothing else — the same limit a plain
  // variable has, and for the same reason (see MatlabVariableNode.descriptionEditable).
  get descriptionEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropValue, PropDataType, PropDescription];
  }
  getPILayout() {
    return [
      { group: "General", items: [PropName, PropValue, PropDataType, PropKind, PropClass, PropDescription] }
    ];
  }
  serializeElement() {
    const fields = this.serial._fields || [];
    const elem = {};
    fields.forEach((field) => {
      const child = this.children.find((c) => c.name === field);
      elem[field] = child ? child.serializeValue() : void 0;
    });
    return elem;
  }
  serializeValue() {
    if (this._rawInput !== void 0 && this.status !== "Modified") {
      return this._rawInput;
    }
    const d = this.dims;
    const fields = this.serial._fields || [];
    if (this._isElementNode) {
      return this.serializeElement();
    }
    const elements = [];
    if (this._numElements > 1) {
      this.children.forEach((elemNode) => {
        elements.push(elemNode.serializeValue());
      });
    } else {
      elements.push(this.serializeElement());
    }
    const result = {
      _array_type: "Struct",
      _dimensions: d,
      _elements: elements
    };
    if (this._fieldsDeclared) {
      result._fields = fields;
    }
    result._mw_element_type = this.serial._mw_element_type || "MATLABArray";
    return result;
  }
  serializeXml(tagName, attrs, indent) {
    const p = pad(indent);
    const d = this.dims;
    let attrStr = "";
    if (attrs && attrs.Name) {
      attrStr += ' Name="' + escapeXml(attrs.Name) + '"';
    }
    if (this._isElementNode) {
      let xml2 = p + "<Element>\n";
      for (const child of this.children) {
        xml2 += child.serializeXml("P", { Name: child.name }, indent + 1) + "\n";
      }
      xml2 += p + "</Element>";
      return xml2;
    }
    const dimAttr = d.every((n) => n === 1) ? "" : ' Dimension="' + d.join("*") + '"';
    let xml = p + "<" + tagName + attrStr + ' Class="struct"' + dimAttr + ">\n";
    if (this._numElements > 1) {
      for (const elemNode of this.children) {
        xml += elemNode.serializeXml("Element", {}, indent + 1) + "\n";
      }
    } else {
      xml += pad(indent + 1) + "<Element>\n";
      for (const child of this.children) {
        xml += child.serializeXml("P", { Name: child.name }, indent + 2) + "\n";
      }
      xml += pad(indent + 1) + "</Element>\n";
    }
    xml += p + "</" + tagName + ">";
    return xml;
  }
  // A struct ARRAY has a single field list shared by every element — that is what
  // makes it an array rather than a bag of unrelated structs — so renaming a field
  // on one element renames it on all of them, and each element's matching child
  // has to be renamed too. Without that, every OTHER element serialized its value
  // under a field name it no longer had: undefined, and the value simply gone from
  // the saved file. An element hands the job up to the array root, which owns them
  // all; the root then renames the shared list once (super) and fixes up the
  // siblings. Renaming a child that already carries the new name is a no-op, which
  // is what makes this safe to call from the element that triggered it.
  _renameField(from, to) {
    if (this._isElementNode && this.parent instanceof _StructNode) {
      this.parent._renameField(from, to);
      return;
    }
    super._renameField(from, to);
    for (const element2 of this.children) {
      if (!element2._isElementNode) {
        continue;
      }
      for (const field of element2.children) {
        if (field.name === from) {
          field.name = to;
        }
      }
    }
  }
  canRemoveChild() {
    return this._isScalarStruct && !this._isElementNode && this.children.length > 0;
  }
  removeChildNode(child) {
    const idx = this.children.indexOf(child);
    if (idx < 0) {
      return;
    }
    this.removeChild(child);
    if (this.serial._fields) {
      const fields = this.serial._fields;
      const fieldIdx = fields.indexOf(child.name);
      if (fieldIdx >= 0) {
        fields.splice(fieldIdx, 1);
      }
    }
    this._markModified();
  }
  restoreChildNode(child, index) {
    this.children.splice(index, 0, child);
    child.parent = this;
    if (this.serial._fields) {
      this.serial._fields.splice(index, 0, child.name);
    }
    this._markModified();
  }
  canAddChild() {
    return this._isScalarStruct && !this._isElementNode;
  }
  addChildNode() {
    const baseName = "field";
    const existing = new Set(this.children.map((c) => c.name));
    let uniqueName = baseName;
    let i = 1;
    while (existing.has(uniqueName)) {
      uniqueName = baseName + i;
      i++;
    }
    const childNode = parseValue(0, uniqueName, this);
    this.addChild(childNode);
    if (!this.serial._fields) {
      this.serial._fields = [];
    }
    this.serial._fields.push(uniqueName);
    this._markModified();
    return childNode;
  }
  execAddChild() {
    return addChildUndoable(this);
  }
  execRemoveChild(child) {
    return removeChildUndoable(this, child);
  }
  static parse(rawVal, name, parent) {
    const fields = fieldsOf(rawVal);
    const serial = {
      _dimensions: rawVal._dimensions,
      _fields: fields,
      _mw_element_type: rawVal._mw_element_type
    };
    const node = new _StructNode(name, parent, serial);
    node._rawInput = rawVal;
    node._fieldsDeclared = Array.isArray(rawVal._fields);
    const elements = rawVal._elements || [];
    if (elements.length > 1) {
      const dims = rawVal._dimensions || [1, elements.length];
      elements.forEach((elem, ei) => {
        const elemSerial = {
          _dimensions: [1, 1],
          _fields: fields,
          _mw_element_type: rawVal._mw_element_type
        };
        const elemNode = new _StructNode(String(ei), node, elemSerial);
        elemNode._isElementNode = true;
        elemNode._fieldsDeclared = node._fieldsDeclared;
        elemNode._subscript = { index: ei, dims, order: "column-major", bracket: "()" };
        fields.forEach((field) => {
          const childNode = parseValue(elem[field], field, elemNode);
          elemNode.addChild(childNode);
        });
        node.addChild(elemNode);
      });
    } else if (elements.length === 1) {
      fields.forEach((field) => {
        const childNode = parseValue(elements[0][field], field, node);
        node.addChild(childNode);
      });
    }
    return node;
  }
  static get defaultName() {
    return "Struct";
  }
  // Exactly the four keys MATLAB writes for a 1x1 struct entry, measured from a text
  // dictionary MATLAB authored (`{"_array_type":"Struct","_dimensions":[1,1],
  // "_elements":[{}],"_mw_element_type":"MATLABArray"}`) and confirmed by MATLAB resaving the
  // entry the Add gallery wrote into exactly that.
  //
  // Three keys went away and one arrived, and the reasoning was the same for all four. We
  // used to write `_num_fields: 0` and `_field_names: []`: MATLAB writes NEITHER name
  // anywhere in either format — 0 occurrences across two dictionaries it wrote itself — and
  // nothing in this package ever read them back, so they were invented, emitted and ignored,
  // the same way `_array_type: 'MATLABArray'` was on the object envelope. `_fields: []` went
  // for a different reason: a TOP-LEVEL struct entry is the one place MATLAB does not declare
  // its field names (it carries `_mw_element_type` instead, and spells the names only on a
  // NESTED struct property such as an EnumTypeDefinition's `Enumerals`). Leaving it out is
  // also what makes `_fieldsDeclared` false, so a field added later is written MATLAB's way —
  // present in `_elements` and absent from any `_fields` list — rather than ours.
  static createDefault(name, parent) {
    const rawVal = {
      _array_type: "Struct",
      _dimensions: [1, 1],
      _mw_element_type: "MATLABArray",
      _elements: [{}]
    };
    return _StructNode.parse(rawVal, name, parent);
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ObjectNode.js
var ObjectNode = class _ObjectNode extends DataNode {
  constructor(name, parent, arrayClass, serial) {
    super(name, parent, serial);
    this.arrayClass = arrayClass;
  }
  get icon() {
    if (this.isDerived && this.arrayClass === "Simulink.ServiceBus") {
      return "serviceInterfaces";
    }
    if (this._isElementArray && this.children.length > 0) {
      return this.children[0].icon;
    }
    return OBJECT_ICON;
  }
  get className() {
    return this.arrayClass;
  }
  // This node's children are MATLAB class properties, whose names are fixed by
  // the class definition and therefore not renameable (see BaseNode).
  get isObjectPropertyBag() {
    return true;
  }
  // The shape as DATA, normalized the way MATLAB's own size() reports it. It used
  // to exist only baked into displayValue, so a consumer — a parity test above all
  // — had to parse the display string to learn the shape, and could not check the
  // shape independently of the string it was already asserting.
  get dims() {
    const raw = this.serial._rawVal || {};
    return effectiveDims(raw._dimensions);
  }
  get displayValue() {
    return summaryForm(this.dims, this.arrayClass);
  }
  getProperties() {
    return [PropName, PropValue, PropDataType, PropDescription];
  }
  getPILayout() {
    return [
      { group: "General", items: [PropName, PropValue, PropDataType, PropKind, PropClass, PropDescription] }
    ];
  }
  // Rebuild the object's serialized value from its LIVE child nodes so a property
  // edit writes back (issue #3). Without this the loaded `_rawVal` is emitted
  // verbatim and edits are silently discarded. An object with no expanded children
  // (an object array, or an empty object) has nothing to rebuild and keeps its raw
  // value unchanged.
  serializeValue() {
    const rawVal = this.serial._rawVal || {};
    if (this.children.length === 0) {
      return rawVal;
    }
    if (this._isElementArray) {
      const elements = this.children.map((child) => {
        const elemVal = child.serializeValue();
        const first = Array.isArray(elemVal?._elements) ? elemVal._elements[0] : void 0;
        return { _properties: first?._properties ?? {} };
      });
      return Object.assign({}, rawVal, { _elements: elements });
    }
    const props = this._getSerializedProperties();
    if (rawVal._object_class) {
      return Object.assign({}, rawVal, { _properties: props });
    }
    const rawElements = rawVal._elements || [{}];
    const firstElem = Object.assign({}, rawElements[0], { _properties: props });
    return Object.assign({}, rawVal, { _elements: [firstElem] });
  }
  // XML write-back. An object ARRAY emits one <Element Class="..."> per element
  // (with a Dimension attr) so a multi-element value round-trips; a scalar falls
  // back to DataNode's single-element form.
  serializeXml(tagName, attrs, indent) {
    if (!this._isElementArray) {
      return super.serializeXml(tagName, attrs, indent);
    }
    const p = pad(indent);
    const ip = pad(indent + 1);
    const rawVal = this.serial._rawVal || {};
    const dims = rawVal._dimensions || [this.children.length, 1];
    let attrStr = "";
    if (attrs && attrs.Name) {
      attrStr += ' Name="' + escapeXml(attrs.Name) + '"';
    }
    const dimAttr = ' Dimension="' + (dims.length > 1 ? dims.join("*") : dims[0] + "*1") + '"';
    let xml = p + "<" + tagName + attrStr + dimAttr + ">\n";
    for (const child of this.children) {
      xml += ip + '<Element Class="' + escapeXml(this.arrayClass) + '">\n';
      const props = child._getSerializedProperties();
      for (const [propName2, propVal] of Object.entries(props)) {
        xml += DataNode.serializePropertyXml(propName2, propVal, indent + 2, child) + "\n";
      }
      xml += ip + "</Element>\n";
    }
    xml += p + "</" + tagName + ">";
    return xml;
  }
  // The property bag rebuilt from live children, keyed by property name and in the
  // children's order. Each value is the child's own serialized form, so a nested
  // object/struct/cell edit recurses through the same path. Feeds both the JSON
  // (serializeValue) and XML (_serializeSimulinkObjectXml) write-back paths.
  _getSerializedProperties() {
    const stored = this.serial._properties || {};
    if (this.children.length === 0) {
      return Object.assign({}, stored);
    }
    const props = _ObjectNode._reservedProps(stored);
    for (const child of this.children) {
      props[child.name] = child.serializeValue();
    }
    return props;
  }
  static parse(rawVal, name, parent) {
    const serial = { _rawVal: rawVal };
    const arrayClass = rawVal._object_class ?? rawVal._array_class;
    const node = new _ObjectNode(name, parent, arrayClass, serial);
    if (rawVal._object_class) {
      _ObjectNode._addPropertyChildren(node, rawVal._properties);
      return node;
    }
    const elements = rawVal._elements || [];
    if (elements.length > 1) {
      node._isElementArray = true;
      const dims = rawVal._dimensions || [1, elements.length];
      elements.forEach((elem, ei) => {
        const elemRaw = {
          _array_class: arrayClass,
          _array_type: "MATLABArray",
          _dimensions: [1, 1],
          _mw_element_type: rawVal._mw_element_type || "MATLABArray",
          _elements: [{ _properties: elem._properties || {} }]
        };
        const elemNode = parseValue(elemRaw, String(ei), node);
        elemNode._subscript = { index: ei, dims, order: "column-major", bracket: "()" };
        node.addChild(elemNode);
      });
    } else if (elements.length === 1) {
      _ObjectNode._addPropertyChildren(node, elements[0]._properties);
    }
    return node;
  }
  // Build a child node per serialized property. Every value — scalar, struct,
  // cell, string, or a nested { _object_class, _properties } object — routes
  // through NodeRegistry.parseValue, which now recognizes the nested-object shape
  // and dispatches it back to ObjectNode. This single path makes objects expand
  // recursively even when nested inside a struct field or a cell element.
  static _addPropertyChildren(node, properties) {
    if (!properties || typeof properties !== "object") {
      return;
    }
    for (const propName2 of Object.keys(properties)) {
      if (propName2.charAt(0) === "_") {
        continue;
      }
      const child = parseValue(properties[propName2], propName2, node);
      node.addChild(child);
    }
  }
  /** The reserved keys of a stored bag — the ones _addPropertyChildren gave no child. */
  static _reservedProps(bag) {
    const out = {};
    for (const key of Object.keys(bag || {})) {
      if (key.charAt(0) === "_") {
        out[key] = bag[key];
      }
    }
    return out;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/SimulinkObjectNode.js
var SimulinkObjectNode = class _SimulinkObjectNode extends DataNode {
  /**
   * The live values this node writes over the file's own property bag — the single place a
   * subclass names what it saves.
   *
   * Insertion order matters and is preserved by both paths: the binary writer emits one
   * `<P>` per key in iteration order and the text path is serialized by `JSON.stringify`, so
   * a key the stored bag already carries keeps its position on disk and a NEW key lands in
   * the order named here. Build the object in the order the file should read.
   *
   * Empty by default, which is the right answer for a node that adds nothing to what the
   * file already held.
   */
  _serializedOverrides() {
    return {};
  }
  // The same merge the text path uses, for the reason the class header records. For a class
  // with NO envelope `_mergeProps` is `Object.assign({}, stored, overrides)` — the previous
  // behaviour, key for key and order for order — so the blast radius of routing through it is
  // exactly the custom-saving classes, which are the ones that were wrong.
  _getSerializedProperties() {
    return this._mergeProps(this._serializedOverrides());
  }
  serializeValue() {
    return this._serializeSimulinkObject(this._serializedOverrides());
  }
  /**
   * The write-back gate for properties whose absence from the file is meaningful: keep a
   * candidate when the FILE already carried its key, or when the node now holds a value for
   * it. Everything else is dropped, so a save invents no key the file did not have.
   *
   * Both halves fail in opposite directions — lose `key in stored` and a key the file
   * carried whose value happens to be empty vanishes from the saved bag, so opening a
   * dictionary and saving it with no edits produces a diff in source control; lose the value
   * half and an edit just made in the Property Inspector is silently discarded on save,
   * surviving only until the file is reopened. The rule is about the FILE's key set, not
   * about what the writer upstream of us meant by leaving a key out —
   * `test/absentPropertyWriteBack.test.ts` states it that way and records which format
   * really omits a key for an empty value and which does not.
   *
   * The truthiness test is what scopes this helper: it fits a property whose "nothing to
   * say" state really is falsy, which for this cluster means the empty-string Descriptions.
   * A property whose absent state is a non-empty DEFAULT must state its own predicate
   * instead — a `Simulink.ValueType` with no `DataType` key IS a double, and 'double' is
   * truthy, so routing it through here would write that default into every dictionary saved
   * without edits.
   */
  _gatedProps(candidates) {
    const stored = this.serial._properties;
    const gated = {};
    for (const [key, val] of Object.entries(candidates)) {
      if (key in stored || val) {
        gated[key] = val;
      }
    }
    return gated;
  }
  /**
   * The property bag inside a Simulink object's rawVal — its first element's `_properties`,
   * or an empty bag when the file carries neither.
   *
   * Stated once here because every subclass's `static parse` needs it and all of them used to
   * spell it out identically; a reader who wants to know where a saved object keeps its
   * properties should find one answer, not fourteen.
   *
   * A custom-saving class has no `_properties` in a TEXT dictionary — its whole state is in a
   * `_custom_save` envelope alongside, which this lifts into the bag under SAVEOBJ_KEY so the
   * rest of the model sees the envelope in the same place for both formats (XmlUtils'
   * CUSTOM_SAVE_KEY carries the full account). Until it did, `serial._properties` for a
   * `Simulink.VariantVariable` read from a text dictionary was `{}` — indistinguishable from
   * an object that genuinely has nothing in it, which is why `_mergeProps`' envelope handling
   * silently did not engage for text and an edit went only to a sibling MATLAB ignores.
   */
  static _propsOf(rawVal) {
    const elem = rawVal._elements && rawVal._elements[0];
    const props = elem && elem._properties;
    const envelope = elem && elem[CUSTOM_SAVE_KEY];
    if (envelope === void 0) {
      return props || {};
    }
    return Object.assign({}, props, { [SAVEOBJ_KEY]: envelope });
  }
  /**
   * A fresh single-element rawVal envelope for a new Simulink object of `className`, carrying
   * `properties` as its element's property bag.
   *
   * The envelope is what MATLAB writes around every scalar object — a 1x1 MATLABArray holding
   * one element — and every class here minted it identically. Stated once so a new class gets
   * the shape right by construction rather than by copying a neighbour.
   *
   * There is deliberately no `_array_type` key. We used to write `_array_type: 'MATLABArray'`
   * here, and MATLAB writes it on NONE of the fifteen object entries of a dictionary it
   * authored itself — `_array_class` is what says "this is an object", and `_array_type` is the
   * tag for the three container shapes ('Struct', 'Cell', 'String') that have no class. Nothing
   * in this package ever read the value 'MATLABArray' back, so it was a key we invented,
   * emitted, and then ignored.
   *
   * Nor is there an `_id`. MATLAB stamps one on every element ("1", "2", … a document-wide
   * counter) and we leave it out on purpose: it exists to let two properties reference one
   * shared object, a fresh scalar entry shares nothing, and minting ids correctly would mean
   * knowing the highest one already in the document. MATLAB loaded all 28 emitted entries with
   * no `_id` anywhere, so it is not load-bearing for anything the Add gallery can produce.
   *
   * The returned object OWNS `properties` by reference: callers rely on
   * `rawVal._elements[0]._properties` being the same object they passed in, because that
   * aliasing is how a later edit to the node's property bag reaches the bytes written back.
   *
   * This and `_propsOf` are the two members here that are plain `static` rather than
   * `protected`: `SignalNode`, `ParameterNode` and `EnumTypeNode` mint the same envelope while
   * deliberately NOT extending this class (see the class header for why), so `protected` would
   * shut out exactly the callers that need it most.
   */
  static _defaultRawVal(className, properties = {}) {
    return {
      _array_class: className,
      _dimensions: [1, 1],
      _mw_element_type: "MATLABArray",
      _elements: [{ _properties: properties }]
    };
  }
  /**
   * The same envelope for a class that serializes through MATLAB's custom save/load hook:
   * its whole state goes in a saveobj struct, and it has no ordinary properties at all.
   *
   * This exists because a default built the ordinary way **crashed MATLAB**. Given an element
   * with a property bag and no envelope, `SlVariantVariable::loadObj` asks `mxGetField` for
   * the fields its struct is supposed to declare, gets NULL, and dereferences it — a
   * segmentation fault in MATLAB, from a dictionary the Add gallery wrote. So for this family
   * the envelope is not an optimisation or a fidelity detail; it is the only shape that loads.
   *
   * `fields` is MATLAB's own DECLARATION order, which is not the alphabetical order its text
   * writer happens to emit the element in, and `writeIntoSaveobj` will only write a field this
   * list names — so a name missing here is a property no edit can ever reach.
   *
   * Both formats are served by this one shape: the binary writer spells a `_array_type:
   * 'Struct'` bag as `<P Source="saveobj" Class="struct">`, and the text writer moves it to the
   * element-level `_custom_save` MATLAB reads (DataNode._serializeSimulinkObject). Stating it
   * once is the point — the two spellings of this envelope have already drifted apart once,
   * which is the whole of XmlUtils' CUSTOM_SAVE_KEY note.
   */
  static _defaultCustomSaveRawVal(className, fields, element2) {
    return _SimulinkObjectNode._defaultRawVal(className, {
      [SAVEOBJ_KEY]: {
        _array_type: "Struct",
        _dimensions: [1, 1],
        _elements: [element2],
        _fields: fields
      }
    });
  }
  /**
   * An EMPTY MATLAB struct array of the given shape, with its field names declared.
   *
   * A field of an envelope often defaults to one of these — `Simulink.VariantVariable`'s
   * `Choices` is an empty 0x1 struct of Condition/Value — and it has no simpler spelling: a
   * plain `[]` is a double, and MATLAB's loadobj destructures the field expecting a struct.
   *
   * MATLAB's own TEXT writer loses the field names here (it emits `{"_type":"struct",
   * "_value":"[]"}`) and reads that back without complaint, so the names are not load-critical
   * and carrying them is strictly more than MATLAB keeps. They are kept anyway because the
   * binary format does state them and a default that can round-trip through either format
   * unchanged is worth more than one that matches MATLAB's lossier path byte for byte.
   */
  static _emptyStruct(fields, dimensions = [0, 1]) {
    return { _array_type: "Struct", _dimensions: dimensions, _elements: [], _fields: fields };
  }
  /**
   * An EMPTY MATLAB cell array of the given shape — `Simulink.VariantBank`'s
   * `VariantConditions` default, and the same reasoning as `_emptyStruct`: `[]` would be a
   * double where MATLAB's loadobj expects a cell. This shape is spelled identically in both
   * formats, so unlike the struct above there is nothing lost either way.
   */
  static _emptyCell(dimensions = [1, 0]) {
    return { _array_type: "Cell", _dimensions: dimensions, _elements: [] };
  }
  /**
   * The nested `Simulink.CoderInfo` a newly created object carries — every value measured from
   * what MATLAB R2027a writes for a default-constructed one, not inferred. `parameterOrSignal`
   * is the only field that differs by owner: 'Parameter' for `Simulink.Parameter`,
   * `Simulink.Breakpoint` and `Simulink.LookupTable`, 'Signal' for `Simulink.Signal`.
   *
   * That is FOUR classes minting one literal, and it was spelled out verbatim in each. The
   * failure that invites is a copy drifting: MATLAB loads a CoderInfo through `loadobj`, which
   * fills whatever is missing from its own defaults rather than complaining, so a bag that has
   * lost `CustomAttributes` or spells `CustomStorageClass` differently loads as a DIFFERENT
   * storage class with nothing raised anywhere — and it would load wrong for one newly added
   * entry class while the other three stayed right, which is the version of the bug nobody goes
   * looking for. Stated once so the next correction reaches all four.
   *
   * A FRESH object per call, and that is load-bearing rather than incidental: `_defaultRawVal`
   * documents that the bag it is handed is owned by reference, because the aliasing is how a
   * later edit reaches the saved bytes. One module-level constant shared here would give two new
   * entries ONE CoderInfo, so a Storage Class set on either would silently move on both.
   */
  static _defaultCoderInfo(parameterOrSignal) {
    return {
      _object_class: "Simulink.CoderInfo",
      _properties: {
        CSCPackageName: "Simulink",
        CustomAttributes: { _object_class: "SimulinkCSC.AttribClass_Simulink_Default", _properties: {} },
        CustomStorageClass: "Default",
        ParameterOrSignal: parameterOrSignal,
        StorageClass: "Auto"
      }
    };
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ParameterNode.js
var CLASS_NAME = "Simulink.Parameter";
var ParameterNode = class _ParameterNode extends DataNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Value = props.Value;
    this._valueNode = null;
    this.DataType = props.DataType || "auto";
    this.Min = _ParameterNode._normalizeMinMax(props.Min);
    this.Max = _ParameterNode._normalizeMinMax(props.Max);
    this.Unit = props.DocUnits || props.Unit || "";
    this.Description = props.Description || "";
  }
  get icon() {
    return this.isDerived ? "typeConstant" : "wsParameters";
  }
  // Report the class the FILE actually holds, not the one this node is declared
  // for: the Embedded Coder subclass mpt.Parameter is parsed by this node too, and
  // a user must keep seeing `mpt.Parameter` in the Class column. Only the
  // treatment — typed columns, Kind, PI layout — is inherited from the
  // superclass. Falls back to CLASS_NAME for a node with no parsed value behind
  // it (a directly constructed one), so the Class column is never blank.
  get className() {
    const raw = this.serial._rawVal;
    return raw && raw._array_class || CLASS_NAME;
  }
  // A Parameter's declared data type IS a real data type ('int16', 'boolean',
  // 'auto', an AliasType/enum/typedef name), so it belongs in the Data Type
  // column — DataNode returns '' there because most object classes have none.
  // Without this the column and the PI label were blank for every Parameter in
  // every dictionary, and once scalar values started showing inline (no Value
  // child row to carry it) the type had nowhere left to appear.
  get dataType() {
    return this.DataType;
  }
  get displayValue() {
    if (this._valueNode) {
      return this._valueNode.displayValue;
    }
    return PropValue.format(this.Value);
  }
  // Model `rawValue` as this Parameter's Value, giving it a tree row only when
  // the resulting node has children — array elements or struct fields, i.e. the
  // only cases where expanding the row reveals anything. A SCALAR of any class
  // is already shown whole in this Parameter's own Value column, so a row for it
  // would be an expander onto a single restatement of the cell above it.
  //
  // The on-disk spelling must not decide this. A plain double scalar is written
  // as a bare number, but int16(500), Inf, and 3+4i are all written as
  // { _type, _value } wrapper objects — and gating on "is the raw value an
  // object" (what this replaced) therefore gave a row to some scalars and not
  // others, and gave the same Inf parameter a row in a JSON dictionary but not
  // in a binary one, where our own reader hands back a bare number.
  //
  // Holding the node while hiding it (rather than not building it) is what keeps
  // the wrapper alive: it is the node's serializeValue that writes int16/cdata
  // back out, so a scalar that displayed inline off a bare `this.Value` would
  // save as an untyped double — silent retyping of the user's data.
  //
  // Deliberately scoped to Simulink.Parameter: every other class, including a
  // custom object that happens to have a Value property, keeps the general
  // expansion rule and shows a row for whatever its value parses into.
  // `edited` says the raw value was just BUILT from what the user typed rather than
  // read from a file, and it matters because MatlabVariableNode.serializeValue
  // replays an unmodified node's `_rawInput` verbatim. That replay is right for a
  // value that came off disk — it is byte-for-byte round-trip fidelity — but for a
  // value we synthesised it writes our own intermediate spelling straight back out
  // without ever consulting the writer, and two of those spellings are ones MATLAB
  // destroys:
  //
  //   setProperty('Value', '3+4i')      -> {_type: 'cdata', _value: '3+4i'}
  //   setProperty('Value', '[1 2; 3 4]') -> {_type: 'double',
  //                                          _value: 'Matrix(2,2)\n[1, 2]\n[3, 4]'}
  //
  // MATLAB reads the first back out of a text dictionary as an empty 1x0 double
  // (defect 24) and the second likewise, because its body is newline-joined rather
  // than '; '-joined (defect 19). The writer already emits the correct form for
  // both; it simply was not being reached. So an edited value is marked Modified
  // here, which is also just true of it.
  _adoptValueNode(rawValue, edited) {
    const valueNode = parseValue(rawValue, "Value", this);
    this.children = [];
    this._valueNode = valueNode;
    if (edited) {
      valueNode._markModified();
    }
    if (valueNode.children.length > 0) {
      this.addChild(valueNode);
    }
  }
  // Re-decide the Value row after an element or field was added to / removed from
  // the value node — the same rule _adoptValueNode applies at parse time, now that
  // an edit has moved the value across the line. Deleting [1 2] down to one element
  // collapses the value node to the scalar 1, and without this the Parameter kept a
  // childless Value row (an expander onto nothing) until the file was reloaded.
  childStructureChanged(child) {
    if (child !== this._valueNode) {
      return;
    }
    if (child.children.length > 0) {
      if (this.children.length === 0) {
        this.addChild(child);
      }
      return;
    }
    this.children = [];
  }
  // This node's one child IS the class's `Value` property, exactly as an object's
  // children are its properties — so its name is fixed by the class, not chosen by the
  // user. Saying so here is what makes the Value row's Name cell read-only, through the
  // rule children already consult (BaseNode.nameEditable). Without it the table offered
  // a rename that serialize discarded in silence: the property is written under the key
  // `Value` whatever the node is called, so a re-read showed `Value` again.
  get isObjectPropertyBag() {
    return true;
  }
  getProperties() {
    return [PropName, PropValue, PropDataType, PropMin, PropMax, PropUnit, PropDescription, ...schemaColumns(this.className)];
  }
  // PI layout is now declarative — see schema/classes/parameter.json `layout`,
  // resolved by the inherited BaseNode.getPILayout via buildPILayout.
  setProperty(propName2, stringValue) {
    if (propName2 === "Value") {
      const raw = MatlabValueParser_default.parse(stringValue);
      if (!raw) {
        return { error: true, reason: "Invalid MATLAB expression", invalidValue: stringValue, validValue: this.displayValue };
      }
      const parsed = collapseExact(raw);
      if (parsed.type === "cell") {
        return {
          error: true,
          reason: "Invalid value specified for parameter. Value must be a numeric array, fi object, enumerated value, structure whose fields contain valid values, string scalar, or an expression.",
          invalidValue: stringValue,
          validValue: this.displayValue
        };
      }
      if (parsed.type === "logical" && Array.isArray(parsed.value)) {
        const els = parsed.value;
        if (els.length === 1) {
          this.children = [];
          this._valueNode = null;
          this.Value = !!els[0];
        } else {
          this._adoptValueNode({ _type: "logical", _value: formatMatrixSerial(els, parsed.dims, "logical") }, true);
          this.Value = els;
        }
        this._markModified();
        return true;
      }
      if (parsed.type === "string") {
        this._adoptValueNode([parsed.value], true);
        this.Value = [parsed.value];
        this._markModified();
        return true;
      }
      if (parsed.type === "double" && Array.isArray(parsed.value) || parsed.type === "string-array") {
        let rawValue;
        if (parsed.type === "string-array") {
          rawValue = { _array_type: "String", _dimensions: parsed.dims, _elements: parsed.value };
        } else if (parsed.dims && parsed.dims[0] > 1) {
          const rows = parsed.dims[0];
          const cols = parsed.dims[1];
          const rowStrs = [];
          for (let r = 0; r < rows; r++) {
            const vals = [];
            for (let c = 0; c < cols; c++) {
              vals.push(formatMatlabNum(parsed.value[r * cols + c]));
            }
            rowStrs.push("[" + vals.join(", ") + "]");
          }
          rawValue = { _type: "double", _value: "Matrix(" + rows + "," + cols + ")\n" + rowStrs.join("\n") };
        } else {
          rawValue = parsed.value;
        }
        this._adoptValueNode(rawValue, true);
        this.Value = parsed.value;
        this._markModified();
        return true;
      }
      if (parsed.type === "complex") {
        this._adoptValueNode({ _type: "cdata", _value: parsed.value }, true);
        this.Value = parsed.value;
        this._markModified();
        return true;
      }
      this.children = [];
      this._valueNode = null;
      this.Value = parsed.value;
      this._markModified();
      return true;
    }
    if (propName2 === "Min" || propName2 === "Max") {
      return this._setMinMax(propName2, stringValue);
    }
    return DataNode.prototype.setProperty.call(this, propName2, stringValue);
  }
  _getSerializedProperties() {
    let innerValue;
    if (this._valueNode) {
      innerValue = this._valueNode.serializeValue();
    } else {
      innerValue = this.Value;
    }
    const sp = this.serial._properties;
    const props = Object.assign({}, sp);
    if (innerValue !== void 0) {
      props.Value = innerValue;
    }
    if ("Min" in sp || this.Min !== void 0) {
      props.Min = this.Min !== void 0 ? this.Min : [];
    }
    if ("Max" in sp || this.Max !== void 0) {
      props.Max = this.Max !== void 0 ? this.Max : [];
    }
    if ("DocUnits" in sp || this.Unit) {
      props.DocUnits = this.Unit;
    }
    if ("Description" in sp || this.Description) {
      props.Description = this.Description;
    }
    return props;
  }
  serializeValue() {
    const props = this._getSerializedProperties();
    const result = Object.assign({}, this.serial._rawVal);
    result._elements = [Object.assign({}, result._elements[0], { _properties: props })];
    return result;
  }
  serializeXml(tagName, attrs, indent) {
    return this._serializeSimulinkObjectXml(tagName, attrs, indent);
  }
  static get defaultName() {
    return "Param";
  }
  // MATLAB's default `Simulink.Parameter` is an EMPTY parameter, and both halves of that were
  // measured from a dictionary MATLAB authored rather than reasoned about: `Dimensions` is
  // `[0 0]` (`<P Name="Dimensions" Class="double" Dimension="1*2">0.0 0.0</P>` in binary), and
  // there is no `Value` at all in the text file — binary spells it `Class="double"
  // Dimension="0*0"`, the empty double, which is the same value. We used to write
  // `Dimensions: -1` with `Value: 0`, i.e. a scalar zero of inherited width: a parameter that
  // is not the one `Simulink.Parameter` gives you, and the only entry the Add gallery produced
  // carrying a property MATLAB's own default does not have.
  //
  // Omitting `Value` from the bag is what stops it being written, and it goes through
  // `_getSerializedProperties`' `innerValue !== undefined` gate rather than needing a case of
  // its own — an absent Value leaves `this.Value` undefined, so no `Value` key is emitted in
  // either format until the user supplies one. Keys are in MATLAB's text order, which is
  // alphabetical, so a freshly added Parameter's text bytes now match MATLAB's key for key.
  static createDefault(name, parent) {
    const rawVal = SimulinkObjectNode._defaultRawVal(CLASS_NAME, { CoderInfo: SimulinkObjectNode._defaultCoderInfo("Parameter"), Complexity: "real", Dimensions: [0, 0] });
    const props = SimulinkObjectNode._propsOf(rawVal);
    return new _ParameterNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  // _normalizeMinMax is inherited from DataNode — this class had its own identical copy
  // until Simulink.ValueType became the third class to need it. Static inheritance keeps
  // every existing `ParameterNode._normalizeMinMax(...)` call site spelled the same.
  static parse(rawVal, name, parent) {
    const elem = rawVal._elements && rawVal._elements[0];
    const props = elem && elem._properties || {};
    const serial = { _rawVal: rawVal, _properties: props };
    const node = new _ParameterNode(name, parent, props, serial);
    if (props.Value && typeof props.Value === "object" && !(Array.isArray(props.Value) && props.Value.length === 0)) {
      node._adoptValueNode(props.Value);
    }
    return node;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/BaseBusNode.js
function withSourceKeys(atom, sourceKeys) {
  const clone = Object.create(atom);
  clone.sourceKeys = sourceKeys;
  return clone;
}
var BaseBusElementNode = class extends DataNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Description = props.Description || "";
  }
  get icon() {
    return "typeBusElement";
  }
  get displayValue() {
    return "";
  }
  get disabled() {
    return true;
  }
  serializeValue() {
    const props = Object.assign({}, this.serial._properties);
    props.Name = this.name;
    this._applyElementOverrides(props);
    return Object.assign({}, this.serial._rawElem, { _properties: props });
  }
  _applyElementOverrides(props) {
    if ("Description" in this.serial._properties || this.Description) {
      props.Description = this.Description;
    }
  }
};
var BaseBusNode = class extends DataNode {
  constructor(name, parent, serial) {
    super(name, parent, serial);
    this.Description = "";
  }
  get icon() {
    return this.isDerived ? "typeBus" : "wsBus";
  }
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropDataType, PropDescription];
  }
  // PI layout is schema-driven (schema/classes/{bus,connectionBus,serviceBus}.json).
  // Each concrete bus container has a schema entry keyed by its className, so the
  // inherited BaseNode.getPILayout → buildPILayout(className) resolves it.
  _getSerializedProperties() {
    const elementsInternal = this.children.map(function(child) {
      return child.serializeValue();
    });
    const props = Object.assign({}, this.serial._properties);
    const rawEI = this.serial._properties.Elements_internal;
    if (elementsInternal.length > 0) {
      const arrayClass = rawEI && typeof rawEI === "object" && !Array.isArray(rawEI) ? rawEI._array_class || rawEI._object_class || this.constructor.ELEMENT_CLASS_NAME : this.constructor.ELEMENT_CLASS_NAME;
      props.Elements_internal = { _array_class: arrayClass, _dimensions: [elementsInternal.length, 1], _elements: elementsInternal, _mw_element_type: "MATLABArray" };
    } else if (rawEI) {
      props.Elements_internal = [];
    }
    if ("Description" in this.serial._properties || this.Description) {
      props.Description = this.Description;
    }
    return props;
  }
  serializeValue() {
    const props = this._getSerializedProperties();
    const result = Object.assign({}, this.serial._rawVal);
    result._elements = [Object.assign({}, result._elements[0], { _properties: props })];
    return result;
  }
  canRemoveChild() {
    return this.children.length > 0;
  }
  removeChildNode(child) {
    this.removeChild(child);
    this._markModified();
  }
  restoreChildNode(child, index) {
    this.children.splice(index, 0, child);
    child.parent = this;
    this._markModified();
  }
  canAddChild() {
    return true;
  }
  addChildNode() {
    const baseName = "a";
    const existing = new Set(this.children.map(function(c) {
      return c.name;
    }));
    let uniqueName = baseName;
    let i = 1;
    while (existing.has(uniqueName)) {
      uniqueName = baseName + i;
      i++;
    }
    const props = { Name: uniqueName };
    const childSerial = { _rawElem: { _id: this._nextElementId(), _properties: props }, _properties: props };
    const childNode = this._createElementNode(uniqueName, props, childSerial);
    if (childNode) {
      this.addChild(childNode);
      this._markModified();
    }
    return childNode;
  }
  // The highest element _id currently in use within this bus's id namespace.
  // Elements and the bus wrapper share one entry-scoped numbering (bus="1",
  // elements "2", "3", ...). Each child's raw element is walked recursively so
  // nested ids (e.g. a ServiceBus function element's Arguments) are counted too
  // — a new id must clear every id already present, not just the top-level ones.
  _maxElementId() {
    let max2 = 0;
    const consider2 = function(id) {
      const n = typeof id === "string" ? parseInt(id, 10) : typeof id === "number" ? id : NaN;
      if (Number.isFinite(n) && n > max2) {
        max2 = n;
      }
    };
    const walk = function(o) {
      if (o && typeof o === "object") {
        const rec = o;
        if ("_id" in rec) {
          consider2(rec._id);
        }
        Object.keys(rec).forEach(function(k) {
          walk(rec[k]);
        });
      }
    };
    const wrapper = this.serial._rawVal?._elements?.[0];
    if (wrapper) {
      consider2(wrapper._id);
    }
    this.children.forEach(function(c) {
      walk(c.serial._rawElem);
    });
    return max2;
  }
  // Allocate a unique element _id: one past the highest existing id so a new
  // element never collides with the wrapper or a sibling (or a sibling's
  // nested arguments).
  _nextElementId() {
    return String(this._maxElementId() + 1);
  }
  execAddChild() {
    return addChildUndoable(this);
  }
  execRemoveChild(child) {
    return removeChildUndoable(this, child);
  }
  // Overridden by each concrete bus to mint its own element class. The base
  // returns null, which addChildUndoable reports as a refused add — a bus type
  // that forgot to implement this adds nothing rather than a broken element.
  _createElementNode(_name, _props, _serial) {
    return null;
  }
  static {
    this.ELEMENT_CLASS_NAME = "";
  }
  static _parseElements(rawVal, name, parent, BusNodeClass, ElementNodeClass) {
    const elem = rawVal._elements && rawVal._elements[0];
    const props = elem && elem._properties || {};
    const serial = { _rawVal: rawVal, _properties: props };
    const node = new BusNodeClass(name, parent, serial);
    node.Description = props.Description || "";
    const busElements = props.Elements_internal;
    if (busElements && busElements._elements) {
      busElements._elements.forEach(function(busElem) {
        const childProps = busElem._properties || {};
        const elemName = childProps.Name || "";
        if (!elemName && Object.keys(childProps).length === 0) {
          return;
        }
        const childSerial = { _rawElem: busElem, _properties: childProps };
        const childNode = new ElementNodeClass(elemName, node, childProps, childSerial);
        node.addChild(childNode);
      });
    } else if (busElements && busElements._properties) {
      const childProps = busElements._properties;
      const elemName = childProps.Name || "";
      const childSerial = { _rawElem: busElements, _properties: childProps };
      const childNode = new ElementNodeClass(elemName, node, childProps, childSerial);
      node.addChild(childNode);
    }
    return node;
  }
  static _createDefaultBus(name, parent, BusNodeClass, className) {
    let defaultProps;
    if (className === "Simulink.Bus") {
      defaultProps = { DataScope: "Auto", Description: "", Elements_internal: [], HeaderFile: "", PreserveElementDimensions: false };
    } else if (className === "Simulink.ConnectionBus") {
      defaultProps = { Description: "", Elements_internal: [] };
    } else if (className === "Simulink.ServiceBus") {
      defaultProps = { Description: "", Elements_internal: [] };
    } else {
      defaultProps = {};
    }
    const rawVal = SimulinkObjectNode._defaultRawVal(className, defaultProps);
    const props = defaultProps;
    const serial = { _rawVal: rawVal, _properties: props };
    return new BusNodeClass(name, parent, serial);
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/SignalNode.js
var CLASS_NAME2 = "Simulink.Signal";
var SignalNode = class _SignalNode extends DataNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    const rawDataType = props.DataType_internal !== void 0 ? props.DataType_internal : props.DataType;
    this.DataType = rawDataType || "auto";
    this.Min = props.Min;
    this.Max = props.Max;
    this.Unit = props.DocUnits || props.Unit || "";
    this.Description = props.Description || "";
  }
  get icon() {
    return this.isDerived ? "serviceInterfaces" : "wsSignal";
  }
  // Report the class the FILE actually holds — same reason as ParameterNode's:
  // mpt.Signal is parsed by this node and must still show as mpt.Signal in the
  // Class column, inheriting only the treatment. CLASS_NAME is the fallback for a
  // node with no parsed value behind it.
  get className() {
    const raw = this.serial._rawVal;
    return raw && raw._array_class || CLASS_NAME2;
  }
  // A Signal has no scalar "value" — the Value column is empty and not editable.
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  // Same argument as ParameterNode.dataType: a Signal's DataType IS a real data
  // type ('single', 'boolean', 'auto', an AliasType name), so it belongs in the
  // Data Type column. Without this the column and the PI row were blank for
  // every Signal in every channel even though all four carry the key.
  get dataType() {
    return this.DataType;
  }
  getProperties() {
    return [PropName, withSourceKeys(PropDataType, ["DataType", "DataType_internal"]), PropMin, PropMax, PropUnit, PropDescription, ...schemaColumns(this.className)];
  }
  // PI layout is now declarative — see schema/classes/signal.json `layout`,
  // resolved by the inherited BaseNode.getPILayout via buildPILayout.
  setProperty(propName2, stringValue) {
    if (propName2 === "Min" || propName2 === "Max") {
      return this._setMinMax(propName2, stringValue);
    }
    return DataNode.prototype.setProperty.call(this, propName2, stringValue);
  }
  _getSerializedProperties() {
    const sp = this.serial._properties;
    const unitKey = "DocUnits" in sp ? "DocUnits" : "Unit";
    const props = Object.assign({}, sp);
    if ("Min" in sp || this.Min !== void 0) {
      props.Min = this.Min !== void 0 ? this.Min : [];
    }
    if ("Max" in sp || this.Max !== void 0) {
      props.Max = this.Max !== void 0 ? this.Max : [];
    }
    if (unitKey in sp || this.Unit) {
      props[unitKey] = this.Unit;
    }
    if ("Description" in sp || this.Description) {
      props.Description = this.Description;
    }
    return props;
  }
  serializeValue() {
    const sp = this.serial._properties;
    const unitKey = "DocUnits" in sp ? "DocUnits" : "Unit";
    const overrides = {};
    if ("Min" in sp || this.Min !== void 0) {
      overrides.Min = this.Min;
    }
    if ("Max" in sp || this.Max !== void 0) {
      overrides.Max = this.Max;
    }
    if (unitKey in sp || this.Unit) {
      overrides[unitKey] = this.Unit;
    }
    if ("Description" in sp || this.Description) {
      overrides.Description = this.Description;
    }
    return this._serializeSimulinkObject(overrides);
  }
  static get defaultName() {
    return "Signal";
  }
  static createDefault(name, parent) {
    const rawVal = SimulinkObjectNode._defaultRawVal(CLASS_NAME2, { CoderInfo: SimulinkObjectNode._defaultCoderInfo("Signal"), LoggingInfo: { _object_class: "Simulink.LoggingInfo", _properties: {} } });
    const props = SimulinkObjectNode._propsOf(rawVal);
    return new _SignalNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const elem = rawVal._elements && rawVal._elements[0];
    const props = elem && elem._properties || {};
    const serial = { _rawVal: rawVal, _properties: props };
    return new _SignalNode(name, parent, props, serial);
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropComplexity.js
var OPTIONS = ["real", "complex"];
var PropComplexity = class {
  static {
    this.key = "complexity";
  }
  static {
    this.displayName = "Complexity";
  }
  static {
    this.editor = "select";
  }
  static {
    this.column = "complexity";
  }
  static {
    this.nodeProperty = "Complexity";
  }
  static {
    this.sourceKeys = ["Complexity"];
  }
  static readValue(node) {
    return node.Complexity || "";
  }
  static readOptions() {
    return OPTIONS;
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropDimensions.js
var PropDimensions = class _PropDimensions {
  static {
    this.key = "dimensions";
  }
  static {
    this.displayName = "Dimensions";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = "dimensions";
  }
  static {
    this.sourceKeys = ["Dimensions"];
  }
  static readValue(node) {
    const d = node.Dimensions;
    return _PropDimensions.format(d);
  }
  static format(value) {
    if (value === void 0 || value === null) {
      return "";
    }
    if (Array.isArray(value)) {
      return "[" + value.map(formatMatlabNum).join(" ") + "]";
    }
    return formatMatlabNum(value);
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropDimensionsMode.js
var OPTIONS2 = ["Fixed", "Variable"];
var PropDimensionsMode = class {
  static {
    this.key = "dimensionsMode";
  }
  static {
    this.displayName = "Dimensions Mode";
  }
  static {
    this.editor = "select";
  }
  static {
    this.column = "dimensionsMode";
  }
  static {
    this.nodeProperty = "DimensionsMode";
  }
  static {
    this.sourceKeys = ["DimensionsMode"];
  }
  static readValue(node) {
    return node.DimensionsMode || "";
  }
  static readOptions() {
    return OPTIONS2;
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/BusNode.js
var CLASS_NAME3 = "Simulink.Bus";
var BusElementNode = class _BusElementNode extends BaseBusElementNode {
  constructor(name, parent, props, serial) {
    super(name, parent, props, serial);
    const rawMin = props.Min_internal !== void 0 ? props.Min_internal : props.Min;
    const rawMax = props.Max_internal !== void 0 ? props.Max_internal : props.Max;
    this.Min = _BusElementNode._normalizeMinMax(rawMin);
    this.Max = _BusElementNode._normalizeMinMax(rawMax);
    this.Unit = props.DocUnits || props.Unit || "";
    const rawDataType = props.DataType_internal !== void 0 ? props.DataType_internal : props.DataType;
    this.DataType = rawDataType || "double";
    this.Complexity = props.Complexity || "real";
    this.Dimensions = props.Dimensions;
    this.DimensionsMode = props.DimensionsMode || "Fixed";
  }
  // A StructType's elements use the struct-element icon; a derived
  // DataInterface's use the arch bus-element icon; a plain Design Data bus's
  // use the workspace bus-element icon.
  get icon() {
    const parent = this.parent;
    if (parent?.isStructType) {
      return "typeStructElement";
    }
    return parent?.isDerived ? "typeBusElement" : "wsBusElement";
  }
  // The element's Class is its object class (Simulink.BusElement), not its
  // mapped data type — that belongs in the Data Type column below.
  get className() {
    return "Simulink.BusElement";
  }
  // A bus element's mapped data type is a real data type — show it in the column.
  get dataType() {
    return this.DataType;
  }
  getProperties() {
    return [PropName, PropDataType, PropDimensions, PropComplexity, PropDimensionsMode, PropMin, PropMax, PropUnit, PropDescription];
  }
  // DataType/Min/Max read the `*_internal` aliased raw keys, so widen their
  // sourceKeys to both spellings — otherwise the alias leaks into "Other".
  getPILayout() {
    return [
      { group: "General", items: [
        PropName,
        withSourceKeys(PropDataType, ["DataType", "DataType_internal"]),
        PropKind,
        PropClass
      ] },
      { group: "Value Properties", items: [
        PropDimensions,
        PropComplexity,
        PropDimensionsMode,
        withSourceKeys(PropMin, ["Min", "Min_internal"]),
        withSourceKeys(PropMax, ["Max", "Max_internal"]),
        PropUnit,
        PropDescription
      ] }
    ];
  }
  // Route Min/Max through the shared, MATLAB-verified "finite real double
  // scalar" validator (verified error: "Minimum on element 'x' must be a finite
  // real double scalar value"). Without this override the edit falls through to
  // DataNode's generic numeric path, which wrongly accepts Inf/NaN.
  setProperty(propName2, stringValue) {
    if (propName2 === "Min" || propName2 === "Max") {
      return this._setMinMax(propName2, stringValue);
    }
    const notAnEnumeral = this._rejectUnknownEnumeral(propName2, stringValue);
    if (notAnEnumeral) {
      return notAnEnumeral;
    }
    return super.setProperty(propName2, stringValue);
  }
  _applyElementOverrides(props) {
    const sp = this.serial._properties;
    const minKey = "Min_internal" in sp ? "Min_internal" : "Min";
    const maxKey = "Max_internal" in sp ? "Max_internal" : "Max";
    const unitKey = "DocUnits" in sp ? "DocUnits" : "Unit";
    const dtKey = "DataType_internal" in sp ? "DataType_internal" : "DataType";
    if (minKey in sp || this.Min !== void 0) {
      props[minKey] = this.Min !== void 0 ? this.Min : [];
    }
    if (maxKey in sp || this.Max !== void 0) {
      props[maxKey] = this.Max !== void 0 ? this.Max : [];
    }
    if (unitKey in sp || this.Unit) {
      props[unitKey] = this.Unit;
    }
    if (dtKey in sp || this.DataType !== "double") {
      props[dtKey] = this.DataType;
    }
    if ("Complexity" in sp || this.Complexity && this.Complexity !== "real") {
      props.Complexity = this.Complexity;
    }
    if ("DimensionsMode" in sp || this.DimensionsMode && this.DimensionsMode !== "Fixed") {
      props.DimensionsMode = this.DimensionsMode;
    }
    if ("Description" in sp || this.Description) {
      props.Description = this.Description;
    }
  }
};
var BusNode = class _BusNode extends BaseBusNode {
  constructor() {
    super(...arguments);
    this.isStructType = false;
  }
  get icon() {
    if (this.isStructType) {
      return "typeStruct";
    }
    return super.icon;
  }
  get className() {
    return CLASS_NAME3;
  }
  _createElementNode(name, props, serial) {
    return new BusElementNode(name, this, props, serial);
  }
  static {
    this.ELEMENT_CLASS_NAME = "Simulink.BusElement";
  }
  static get defaultName() {
    return "Bus";
  }
  static createDefault(name, parent) {
    return BaseBusNode._createDefaultBus(name, parent, _BusNode, CLASS_NAME3);
  }
  static parse(rawVal, name, parent) {
    return BaseBusNode._parseElements(rawVal, name, parent, _BusNode, BusElementNode);
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ConnectionBusNode.js
var CLASS_NAME4 = "Simulink.ConnectionBus";
var DEFAULT_CONNECTION_TYPE = "Connection: <domain name>";
var ConnectionBusElementNode = class extends BaseBusElementNode {
  constructor(name, parent, props, serial) {
    super(name, parent, props, serial);
    const rawType = props.Type_internal !== void 0 ? props.Type_internal : props.Type;
    this.Type = rawType || DEFAULT_CONNECTION_TYPE;
  }
  // A derived PhysicalInterface's elements use the arch connection-element
  // icon; a plain Design Data ConnectionBus's use the workspace variant.
  get icon() {
    return this.parent?.isDerived ? "typeConnectionElement" : "wsConnectionElement";
  }
  // The element's Class is its object class (Simulink.ConnectionElement), not
  // its mapped connection type — that belongs in the Data Type column below.
  get className() {
    return "Simulink.ConnectionElement";
  }
  // A connection element's mapped connection type is a real data type — show it.
  get dataType() {
    return this.Type;
  }
  getProperties() {
    return [PropName, PropDataType, PropDescription];
  }
  // The Data Type column reads the connection type from the `Type_internal`
  // aliased raw key (falling back to `Type`), so widen sourceKeys to both
  // spellings — otherwise the alias leaks into the "Other" catch-all.
  // Common "General" identity group, then the element's value-semantics.
  // DataType widens sourceKeys to the `Type`/`Type_internal` aliases so neither
  // spelling leaks into "Other".
  getPILayout() {
    return [
      { group: "General", items: [PropName, withSourceKeys(PropDataType, ["Type_internal", "Type"]), PropKind, PropClass] },
      { group: "Value Properties", items: [PropDescription] }
    ];
  }
  _applyElementOverrides(props) {
    const sp = this.serial._properties;
    const typeKey = "Type_internal" in sp ? "Type_internal" : "Type";
    if (typeKey in sp || this.Type !== DEFAULT_CONNECTION_TYPE) {
      props[typeKey] = this.Type;
    }
    if ("Description" in sp || this.Description) {
      props.Description = this.Description;
    }
  }
};
var ConnectionBusNode = class _ConnectionBusNode extends BaseBusNode {
  get icon() {
    return this.isDerived ? "typeConnection" : "wsConnectionBus";
  }
  get className() {
    return CLASS_NAME4;
  }
  _createElementNode(name, props, serial) {
    return new ConnectionBusElementNode(name, this, props, serial);
  }
  static {
    this.ELEMENT_CLASS_NAME = "Simulink.ConnectionElement";
  }
  static get defaultName() {
    return "ConnectionBus";
  }
  static createDefault(name, parent) {
    return BaseBusNode._createDefaultBus(name, parent, _ConnectionBusNode, CLASS_NAME4);
  }
  static parse(rawVal, name, parent) {
    return BaseBusNode._parseElements(rawVal, name, parent, _ConnectionBusNode, ConnectionBusElementNode);
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ServiceBusNode.js
var CLASS_NAME5 = "Simulink.ServiceBus";
var FunctionElementNode = class extends BaseBusElementNode {
  constructor(name, parent, props, serial) {
    super(name, parent, props, serial);
    this.Prototype = props.Prototype || "";
  }
  get icon() {
    return "function";
  }
  get className() {
    return "Simulink.FunctionElement";
  }
  // A function element has no meaningful data type — the DataType column is
  // empty (not applicable).
  get dataType() {
    return "";
  }
  get displayValue() {
    return this.Prototype;
  }
  // A Simulink.FunctionElement has only Name / Prototype / Asynchronous /
  // Arguments (verified against MATLAB) — notably NO Description and NO
  // DataType. Surfacing those foreign props previously let an edit inject a key
  // the object doesn't own; we list just Name here (the Value column shows the
  // Prototype via displayValue).
  getProperties() {
    return [PropName];
  }
  // Common "General" identity group. DataType/Description are intentionally
  // absent (a FunctionElement owns neither — see note above); the Value column
  // shows the Prototype via displayValue.
  getPILayout() {
    return [{ group: "General", items: [PropName, PropKind, PropClass] }];
  }
};
var ServiceBusNode = class _ServiceBusNode extends BaseBusNode {
  // A derived ServiceBus is an Architectural Data ServiceInterface.
  get icon() {
    return this.isDerived ? "serviceInterfaces" : "wsDefault";
  }
  get className() {
    return CLASS_NAME5;
  }
  // A service interface has no scalar value — the Value column is empty and not
  // editable, matching the other bus-like interface types.
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  _createElementNode(name, props, serial) {
    return new FunctionElementNode(name, this, props, serial);
  }
  // Add a new service function. Unlike a plain bus element, a
  // Simulink.FunctionElement carries a Prototype ("y = fn(u,v)") and an
  // Arguments BusElement array [u, v, y]. The function name fn uses an
  // increasing number so it stays unique, and the element plus each argument
  // get fresh entry-scoped _ids (past every id already in use, including the
  // nested argument ids of sibling functions).
  addChildNode() {
    const existing = new Set(this.children.map(function(c) {
      return c.name;
    }));
    let n = this.children.length;
    let fnName = "f" + n;
    while (existing.has(fnName)) {
      n++;
      fnName = "f" + n;
    }
    const prototype = "y = " + fnName + "(u,v)";
    let id = this._maxElementId();
    const elemId = String(++id);
    const argNames = ["u", "v", "y"];
    const argElements = argNames.map(function(argName) {
      return { _id: String(++id), _properties: { Complexity: "real", Dimensions: 1, DimensionsMode: "Fixed", DocUnits: "", Name: argName } };
    });
    const props = {
      Arguments: { _array_class: "Simulink.BusElement", _dimensions: [argElements.length, 1], _elements: argElements },
      Asynchronous: false,
      Name: fnName,
      Prototype: prototype
    };
    const childSerial = { _rawElem: { _id: elemId, _properties: props }, _properties: props };
    const childNode = new FunctionElementNode(fnName, this, props, childSerial);
    this.addChild(childNode);
    this._markModified();
    return childNode;
  }
  static {
    this.ELEMENT_CLASS_NAME = "Simulink.FunctionElement";
  }
  static get defaultName() {
    return "ServiceInterface";
  }
  static createDefault(name, parent) {
    return BaseBusNode._createDefaultBus(name, parent, _ServiceBusNode, CLASS_NAME5);
  }
  static parse(rawVal, name, parent) {
    return BaseBusNode._parseElements(rawVal, name, parent, _ServiceBusNode, FunctionElementNode);
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/EnumTypeNode.js
var CLASS_NAME6 = "Simulink.data.dictionary.EnumTypeDefinition";
var EnumValueNode = class extends DataNode {
  constructor(name, parent, props) {
    super(name, parent, { _rawProps: props });
    this.Value = props.Value;
    this.Description = props.Description || "";
  }
  // The enumeral that the parent EnumType defaults to gets the "current" icon;
  // every other enumeral gets the plain bus-element icon. When the parent has no
  // DefaultValue set, the first enumeral is treated as the current one. A
  // derived (Architectural Data) enum uses the arch "current" icon; a plain
  // Design Data enum uses the workspace variant.
  get icon() {
    const parent = this.parent;
    if (!parent) {
      return "busElement";
    }
    const isCurrent = parent.DefaultValue ? parent.DefaultValue === this.name : parent.children[0] === this;
    if (!isCurrent) {
      return "busElement";
    }
    return parent.isDerived ? "typeElement" : "wsElement";
  }
  get className() {
    return CLASS_NAME6;
  }
  // An enumeral has no meaningful data type — the DataType column is empty
  // (not applicable).
  get dataType() {
    return "";
  }
  get displayValue() {
    return this.Value !== void 0 ? String(this.Value) : "";
  }
  get disabled() {
    return true;
  }
  getProperties() {
    return [PropName, PropValue, PropDescription];
  }
  // An enumeral shares its parent's className (EnumTypeDefinition), so it can't
  // be schema-keyed; author the common "General" group directly. DataType is
  // omitted (an enumeral has no data type — see dataType getter above).
  getPILayout() {
    return [{ group: "General", items: [PropName, PropValue, PropKind, PropClass, PropDescription] }];
  }
  serializeValue() {
    const raw = Object.assign({}, this.serial._rawProps);
    raw.Name = this.name;
    raw.Value = this.Value;
    raw.Description = this.Description;
    return raw;
  }
};
var EnumTypeNode = class _EnumTypeNode extends DataNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.DefaultValue = props.DefaultValue || "";
    this.Description = props.Description || "";
  }
  get icon() {
    return this.isDerived ? "typeEnum" : "wsEnum";
  }
  get className() {
    return CLASS_NAME6;
  }
  // The Value column shows the enum's DefaultValue; when none is set it falls
  // back to the first enumeral's name (the same one marked "current" by the
  // child icon rule).
  get displayValue() {
    if (this.DefaultValue) {
      return this.DefaultValue;
    }
    return this.children[0] && this.children[0].name || "";
  }
  getProperties() {
    return [PropName, PropEnumValue, PropDataType, PropDescription];
  }
  // PI layout is schema-driven (schema/classes/enumType.json). NOTE: EnumValueNode
  // shares this className but keeps its own getPILayout override (a value row, not
  // the enum type), so it never resolves the schema layout.
  _getSerializedProperties() {
    const enumerals = this.children.map(function(child) {
      return child.serializeValue();
    });
    const props = Object.assign({}, this.serial._properties);
    if ("DefaultValue" in this.serial._properties || this.DefaultValue) {
      props.DefaultValue = this.DefaultValue;
    }
    if ("Description" in this.serial._properties || this.Description) {
      props.Description = this.Description;
    }
    const rawEnumerals = this.serial._rawEnumerals || {};
    const enumWrapper = {};
    Object.keys(rawEnumerals).forEach(function(k) {
      if (k === "_elements") {
        enumWrapper._elements = enumerals;
      } else {
        enumWrapper[k] = rawEnumerals[k];
      }
    });
    if (!("_elements" in rawEnumerals)) {
      enumWrapper._elements = enumerals;
    }
    enumWrapper._dimensions = [1, enumerals.length];
    props.Enumerals = enumWrapper;
    return props;
  }
  serializeValue() {
    const props = this._getSerializedProperties();
    const result = Object.assign({}, this.serial._rawVal);
    result._elements = [Object.assign({}, result._elements[0], { _properties: props })];
    return result;
  }
  canRemoveChild() {
    return this.children.length > 0;
  }
  removeChildNode(child) {
    this.removeChild(child);
    this._markModified();
  }
  restoreChildNode(child, index) {
    this.children.splice(index, 0, child);
    child.parent = this;
    this._markModified();
  }
  canAddChild() {
    return true;
  }
  addChildNode() {
    const existing = new Set(this.children.map(function(c) {
      return c.name;
    }));
    let i = 1;
    let uniqueName = "enum" + i;
    while (existing.has(uniqueName)) {
      i++;
      uniqueName = "enum" + i;
    }
    const nextVal = String(this.children.length);
    const props = { Name: uniqueName, Value: nextVal, Description: "" };
    const childNode = new EnumValueNode(uniqueName, this, props);
    this.addChild(childNode);
    this._markModified();
    return childNode;
  }
  execAddChild() {
    return addChildUndoable(this);
  }
  execRemoveChild(child) {
    return removeChildUndoable(this, child);
  }
  static get defaultName() {
    return "EnumType";
  }
  static createDefault(name, parent) {
    const enumerals = { _array_type: "Struct", _dimensions: [1, 1], _elements: [{ Description: "", Name: "enum1", Value: "0" }], _fields: ["Name", "Value", "Description"] };
    const rawVal = SimulinkObjectNode._defaultRawVal(CLASS_NAME6, { Enumerals: enumerals });
    const props = SimulinkObjectNode._propsOf(rawVal);
    const serial = { _rawVal: rawVal, _properties: props, _rawEnumerals: enumerals };
    const node = new _EnumTypeNode(name, parent, props, serial);
    const childProps = enumerals._elements[0];
    const childNode = new EnumValueNode("enum1", node, childProps);
    node.addChild(childNode);
    return node;
  }
  static parse(rawVal, name, parent) {
    const elem = rawVal._elements && rawVal._elements[0];
    const props = elem && elem._properties || {};
    const enumerals = props.Enumerals || {};
    const serial = { _rawVal: rawVal, _properties: props, _rawEnumerals: enumerals };
    const node = new _EnumTypeNode(name, parent, props, serial);
    if (enumerals._elements) {
      enumerals._elements.forEach(function(en) {
        const enumName = en.Name || "";
        const childNode = new EnumValueNode(enumName, node, en);
        node.addChild(childNode);
      });
    }
    return node;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/AliasTypeNode.js
var CLASS_NAME7 = "Simulink.AliasType";
var AliasTypeNode = class _AliasTypeNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.BaseType = props.BaseType || "";
    this.Description = props.Description || "";
  }
  get icon() {
    return this.isDerived ? "typeAlias" : "wsAlias";
  }
  get className() {
    return CLASS_NAME7;
  }
  // An alias has no "value" — its base type ("double") is surfaced in the Data
  // Type column via PropBaseType. The Value column is therefore empty and not
  // editable.
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  // Table columns: PropBaseType owns the Data Type column, so PropDataType (which
  // would show the class name 'Simulink.AliasType') is omitted here.
  getProperties() {
    return [PropName, PropBaseType, PropDescription];
  }
  // PI layout is schema-driven (schema/classes/aliasType.json).
  // BaseType is UNGATED: an alias with no base type is not a type at all, so MATLAB gets
  // the key even as the empty string a half-built entry carries. It is named first because
  // that is the order a bag that lacks both keys reads on disk.
  _serializedOverrides() {
    return Object.assign({ BaseType: this.BaseType }, this._gatedProps({ Description: this.Description }));
  }
  static get defaultName() {
    return "AliasType";
  }
  static createDefault(name, parent) {
    const rawVal = _AliasTypeNode._defaultRawVal(CLASS_NAME7, { BaseType: "double", DataScope: "Auto", Description: "", HeaderFile: "" });
    const props = _AliasTypeNode._propsOf(rawVal);
    return new _AliasTypeNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _AliasTypeNode._propsOf(rawVal);
    return new _AliasTypeNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ConfigSetNode.js
var CLASS_NAME8 = "Simulink.ConfigSet";
var ConfigSetNode = class _ConfigSetNode extends SimulinkObjectNode {
  // The config set's own Name property. In a .sldd the entry name and this
  // property are the same string — both parse paths build the node with
  // _properties.Name equal to the entry name — so this is a view of `name`
  // rather than a second copy. It used to be an independently stored field,
  // which let the two drift: renaming the entry moved `name` but left
  // ConfigName stale, and since serializeValue writes ConfigName, the saved
  // file kept the OLD name and the entry reverted on reopen.
  get ConfigName() {
    return this.name;
  }
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Description = props.Description || "";
  }
  get icon() {
    return this.active ? "check_settings" : "settings";
  }
  get className() {
    return CLASS_NAME8;
  }
  // A ConfigSet has no scalar "value" — the Value column is empty and not editable.
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropDataType, PropDescription];
  }
  // PI layout: schema-driven "General" group (classes/configSet.json).
  // Name is UNGATED: a config set MATLAB can load has to be able to say what it is called,
  // so the key is written whatever the file carried — and because it is a view of `name`, a
  // renamed entry saves under the new name on both paths. Description is GATED, on the same
  // terms as every other Description in this cluster: a config set whose file never carried
  // one must not gain an empty one on save, or opening a dictionary and saving it with no
  // edits produces a diff in source control. Order follows AliasTypeNode — the identity key
  // the class owns, then the gated description.
  _serializedOverrides() {
    return Object.assign({ Name: this.ConfigName }, this._gatedProps({ Description: this.Description }));
  }
  static get defaultName() {
    return "Configuration";
  }
  static createDefault(name, parent) {
    const rawVal = _ConfigSetNode._defaultRawVal(CLASS_NAME8, { Name: name || "Configuration" });
    const props = _ConfigSetNode._propsOf(rawVal);
    return new _ConfigSetNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _ConfigSetNode._propsOf(rawVal);
    return new _ConfigSetNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/VariantExpressionNode.js
var CLASS_NAME9 = "Simulink.VariantExpression";
var VariantExpressionNode = class _VariantExpressionNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Condition = props.Condition || "";
  }
  get icon() {
    return "wsVariant";
  }
  get className() {
    return CLASS_NAME9;
  }
  get displayValue() {
    return PropCondition.format(this.Condition);
  }
  getProperties() {
    return [PropName, PropCondition, PropDataType];
  }
  // PI layout: schema-driven "General" group (classes/variantExpression.json).
  // UNGATED: the Condition is the expression itself, so it is written whether or not the
  // file carried the key.
  _serializedOverrides() {
    return { Condition: this.Condition };
  }
  static get defaultName() {
    return "VariantExpression";
  }
  static createDefault(name, parent) {
    const rawVal = _VariantExpressionNode._defaultRawVal(CLASS_NAME9, { Condition: "" });
    const props = _VariantExpressionNode._propsOf(rawVal);
    return new _VariantExpressionNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _VariantExpressionNode._propsOf(rawVal);
    return new _VariantExpressionNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/VariantVariableNode.js
var CLASS_NAME10 = "Simulink.VariantVariable";
var VariantVariableNode = class _VariantVariableNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Specification = props.Specification || "";
  }
  get icon() {
    return "variant_wsParameters";
  }
  get className() {
    return CLASS_NAME10;
  }
  get displayValue() {
    return PropSpecification.format(this.Specification);
  }
  getProperties() {
    return [PropName, PropSpecification, PropDataType];
  }
  // PI layout: schema-driven "General" group (classes/variantVariable.json).
  // UNGATED: the Specification is the variable's whole content. What is special here is the
  // BINARY path below, not this list.
  _serializedOverrides() {
    return { Specification: this.Specification };
  }
  // This class used to override `_getSerializedProperties` to route the binary path through
  // `_mergeProps`, so an EMPTY Specification was not written next to a saveobj envelope: a
  // variant that serializes through saveobj keeps its Specification INSIDE the envelope,
  // where this node cannot see it, so `(props.Specification as string) || ''` above is a
  // default and not a value, and writing it back grew a `<P Name="Specification"
  // Class="char"/>` MATLAB never wrote. The override is gone because SimulinkObjectNode now
  // merges that way for EVERY class — it had to, since VariantBank, VariantBankCoderInfo and
  // VariantConfigurations were growing the same invented property in the binary file for
  // want of the same override (see the class header there).
  static get defaultName() {
    return "VariantVariable";
  }
  // A saveobj envelope, not a property bag — `{ Specification: '' }` here used to SEGFAULT
  // MATLAB, which destructures this class through a custom load hook and dereferences the
  // NULL `mxGetField` returns for a struct that is not there. Fields, their order and their
  // default values are all measured from a MATLAB-written dictionary; `Choices` is an empty
  // 0x1 struct of Condition/Value rather than `[]`, because loadobj expects a struct there.
  static createDefault(name, parent) {
    const rawVal = _VariantVariableNode._defaultCustomSaveRawVal(CLASS_NAME10, ["Choices", "Specification", "Bank"], { Choices: _VariantVariableNode._emptyStruct(["Condition", "Value"]), Specification: [], Bank: [] });
    const props = _VariantVariableNode._propsOf(rawVal);
    return new _VariantVariableNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _VariantVariableNode._propsOf(rawVal);
    return new _VariantVariableNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/LookupTableNode.js
var CLASS_NAME11 = "Simulink.LookupTable";
var LookupTableNode = class _LookupTableNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Description = props.Description || "";
  }
  get icon() {
    return "wsLookup";
  }
  get className() {
    return CLASS_NAME11;
  }
  // A LookupTable has no scalar "value" — the Value column is empty and not editable.
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropDataType, PropDescription];
  }
  // PI layout: schema-driven "General" group (classes/lookupTable.json).
  _serializedOverrides() {
    return this._gatedProps({ Description: this.Description });
  }
  static get defaultName() {
    return "LookupTable";
  }
  // MEASURED from what MATLAB R2027a writes for `Simulink.LookupTable` with nothing set, in
  // MATLAB's own alphabetical key order. Four nested objects and two scalars, where the bag used
  // to be EMPTY — so a newly added LookupTable showed a Storage Class of 'Auto' that no write
  // could reach (`writeSourcePath` refuses rather than synthesizing the missing CoderInfo).
  // The Breakpoints/StructTypeInfo classes are shared with `Simulink.Breakpoint` but the VALUES
  // are not: a LookupTable numbers its breakpoint 'BP1'/'N1' against the Breakpoint's 'BP'/'N',
  // because a table has an axis per dimension and a standalone breakpoint set has one.
  static createDefault(name, parent) {
    const rawVal = _LookupTableNode._defaultRawVal(CLASS_NAME11, { AllowMultipleInstancesOfTypeToHaveDifferentTableBreakpointSizes: false, Breakpoints: { _object_class: "Simulink.lookuptable.Breakpoint", _properties: { DataType: "auto", Description: "", Dimensions: [0, 0], FieldName: "BP1", TunableSizeName: "N1", TunableSizeValue: -1, Unit: "" } }, CoderInfo: _LookupTableNode._defaultCoderInfo("Parameter"), StructTypeInfo: { _object_class: "Simulink.lookuptable.StructTypeInfo", _properties: { DataScope: "Auto", HeaderFileName: "", Name: "" } }, SupportTunableSize: false, Table: { _object_class: "Simulink.lookuptable.Table", _properties: { DataType: "auto", Description: "", Dimensions: [0, 0], FieldName: "Table", Unit: "" } } });
    const props = _LookupTableNode._propsOf(rawVal);
    return new _LookupTableNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _LookupTableNode._propsOf(rawVal);
    return new _LookupTableNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/BreakpointNode.js
var CLASS_NAME12 = "Simulink.Breakpoint";
var BreakpointNode = class _BreakpointNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Description = props.Description || "";
  }
  get icon() {
    return "wsSimulinkBreakpoint";
  }
  get className() {
    return CLASS_NAME12;
  }
  // A Breakpoint has no scalar "value" — the Value column is empty and not editable.
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropDataType, PropDescription];
  }
  // PI layout: schema-driven "General" group (classes/breakpoint.json).
  _serializedOverrides() {
    return this._gatedProps({ Description: this.Description });
  }
  static get defaultName() {
    return "Breakpoint";
  }
  // MEASURED from what MATLAB R2027a writes for `Simulink.Breakpoint` with nothing set, in
  // MATLAB's own alphabetical key order. Three of the four properties are themselves nested
  // objects, and the bag used to be EMPTY — which is why a newly added Breakpoint could display
  // a Storage Class of 'Auto' and refuse every write to it: `writeSourcePath` never invents a
  // missing sub-object, so with no CoderInfo there was nowhere for the value to land.
  // 'BP'/'N' are MATLAB's single-breakpoint field names — a LookupTable's own Breakpoints
  // object is the same class numbered 'BP1'/'N1', so the two are NOT interchangeable.
  static createDefault(name, parent) {
    const rawVal = _BreakpointNode._defaultRawVal(CLASS_NAME12, { Breakpoints: { _object_class: "Simulink.lookuptable.Breakpoint", _properties: { DataType: "auto", Description: "", Dimensions: [0, 0], FieldName: "BP", TunableSizeName: "N", TunableSizeValue: -1, Unit: "" } }, CoderInfo: _BreakpointNode._defaultCoderInfo("Parameter"), StructTypeInfo: { _object_class: "Simulink.lookuptable.StructTypeInfo", _properties: { DataScope: "Auto", HeaderFileName: "", Name: "" } }, SupportTunableSize: false });
    const props = _BreakpointNode._propsOf(rawVal);
    return new _BreakpointNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _BreakpointNode._propsOf(rawVal);
    return new _BreakpointNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/NumericTypeNode.js
var CLASS_NAME13 = "Simulink.NumericType";
var NumericTypeNode = class _NumericTypeNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Description = props.Description || "";
  }
  get icon() {
    return this.isDerived ? "typeNumeric" : "wsNumeric";
  }
  get className() {
    return CLASS_NAME13;
  }
  // A NumericType has no scalar "value" — the Value column is empty and not
  // editable (the class name is surfaced in the Data Type column).
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropDataType, PropDescription];
  }
  // PI layout is schema-driven (schema/classes/numericType.json).
  _serializedOverrides() {
    return this._gatedProps({ Description: this.Description });
  }
  static get defaultName() {
    return "NumericType";
  }
  // Every value below is MEASURED from what MATLAB R2027a writes for `Simulink.NumericType`
  // with nothing set, in MATLAB's own alphabetical key order — not a guess at a sensible
  // default. This bag used to be EMPTY, which made a newly added NumericType the one entry in
  // a dictionary that declared no type at all: MATLAB fills the absent keys from its own
  // defaults on load, so the file opened without complaint and the divergence only showed as a
  // diff against a MATLAB-authored dictionary holding the same type.
  // Note the three storage-side spellings — SignednessBool, FixedExponent,
  // SlopeAdjustmentFactor — are what MATLAB SAVES; Signedness/FractionLength/Slope are derived
  // accessors it never writes, so they belong in neither this bag nor a file.
  static createDefault(name, parent) {
    const rawVal = _NumericTypeNode._defaultRawVal(CLASS_NAME13, { Bias: 0, DataScope: "Auto", DataTypeMode: "Double", DataTypeOverride: "Inherit", Description: "", FixedExponent: 0, HeaderFile: "", IsAlias: false, SignednessBool: true, SlopeAdjustmentFactor: 1, WordLength: 64 });
    const props = _NumericTypeNode._propsOf(rawVal);
    return new _NumericTypeNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _NumericTypeNode._propsOf(rawVal);
    return new _NumericTypeNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ValueTypeNode.js
var CLASS_NAME14 = "Simulink.ValueType";
var ValueTypeNode = class _ValueTypeNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Description = props.Description || "";
    this.DataType = props.DataType || "double";
    this.Dimensions = props.Dimensions;
    this.Complexity = props.Complexity || "real";
    this.DimensionsMode = props.DimensionsMode || "Fixed";
    this.Min = _ValueTypeNode._normalizeMinMax(props.Min);
    this.Max = _ValueTypeNode._normalizeMinMax(props.Max);
    this.Unit = props.Unit || props.DocUnits || "";
  }
  get icon() {
    return this.isDerived ? "typeSignalUI" : "wsValue";
  }
  get className() {
    return CLASS_NAME14;
  }
  // The DataType column shows the ValueType's underlying DataType property
  // (defaulting to 'double'), not the class name or the arch kind.
  get dataType() {
    return this.DataType;
  }
  // A ValueType has no scalar "value" — the Value column is empty and not
  // editable (the DataType is surfaced in the Data Type column).
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropDataType, PropDimensions, PropComplexity, PropDimensionsMode, PropMin, PropMax, PropUnit, PropDescription];
  }
  // Override-driven rather than schema-driven, even though schema/classes/valueType.json
  // carries a layout with exactly these groups and this order — the JSON stays, because it
  // is what schemaColumns reads for the table's dimensionsMode column, and the two are
  // pinned against each other by test/valueTypeValueProps.test.ts.
  //
  // The reason is that `complexity` and `dimensionsMode` are NOT in schemaBridge's
  // ATOM_BY_KEY, so the schema route resolves them to the raw descriptor, whose readValue
  // hydrates from `serial._properties`. That is right for a read-only projection and wrong
  // the moment the property becomes an editable node field: an edit lands on the field, the
  // table re-reads the field and updates, and the PI keeps reading the untouched source bag
  // — the same value showing two different things in two panes. (trySetSchemaProperty
  // cannot close that gap: both descriptors are `editor: 'label'`, so it declines them and
  // nothing writes back into the bag.) Going through the atoms makes both panes read the
  // one field. BusElementNode is override-driven for the same reason.
  getPILayout() {
    return [
      { group: "General", items: [PropName, PropDataType, PropKind, PropClass] },
      { group: "Value Properties", items: [
        PropDimensions,
        PropComplexity,
        PropMin,
        PropMax,
        PropUnit,
        PropDimensionsMode,
        PropDescription
      ] }
    ];
  }
  // Min/Max take the shared, MATLAB-verified "finite real double scalar" validator rather
  // than DataNode's generic numeric path, which wrongly accepts Inf/NaN; the two enums take
  // the shared enumeral check, which reads its legal set from the prop atom's readOptions so
  // the values accepted here and the values the dropdown offers cannot diverge.
  setProperty(propName2, stringValue) {
    if (propName2 === "Min" || propName2 === "Max") {
      return this._setMinMax(propName2, stringValue);
    }
    const notAnEnumeral = this._rejectUnknownEnumeral(propName2, stringValue);
    if (notAnEnumeral) {
      return notAnEnumeral;
    }
    return super.setProperty(propName2, stringValue);
  }
  // Keys in MATLAB's own order (alphabetical, as it writes them), so a ValueType that gains
  // a key still reads the way a MATLAB-written one does. Every gate here says the same
  // thing: write the key if the FILE carried it, or if the live value is something other
  // than what its absence means. DataType and the two enums spell that out against their
  // default rather than going through _gatedProps, because each default is truthy and the
  // shared truthiness test would write it back into every ValueType a dictionary never
  // declared one for; the enums also need `this.X &&` so a CLEAR (which stores '') reads as
  // absence and not as a value. Dimensions is deliberately absent: it is read-only, so
  // there is no live value to write over the bag both paths already merge the file's own
  // keys from.
  _serializedOverrides() {
    const sp = this.serial._properties;
    const unitKey = "DocUnits" in sp ? "DocUnits" : "Unit";
    const overrides = {};
    if ("Complexity" in sp || this.Complexity && this.Complexity !== "real") {
      overrides.Complexity = this.Complexity;
    }
    if ("DataType" in sp || this.DataType !== "double") {
      overrides.DataType = this.DataType;
    }
    Object.assign(overrides, this._gatedProps({ Description: this.Description }));
    if ("DimensionsMode" in sp || this.DimensionsMode && this.DimensionsMode !== "Fixed") {
      overrides.DimensionsMode = this.DimensionsMode;
    }
    if ("Max" in sp || this.Max !== void 0) {
      overrides.Max = this.Max !== void 0 ? this.Max : [];
    }
    if ("Min" in sp || this.Min !== void 0) {
      overrides.Min = this.Min !== void 0 ? this.Min : [];
    }
    if (unitKey in sp || this.Unit) {
      overrides[unitKey] = this.Unit;
    }
    return overrides;
  }
  static get defaultName() {
    return "ValueType";
  }
  static createDefault(name, parent) {
    const rawVal = _ValueTypeNode._defaultRawVal(CLASS_NAME14);
    const props = _ValueTypeNode._propsOf(rawVal);
    return new _ValueTypeNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _ValueTypeNode._propsOf(rawVal);
    return new _ValueTypeNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/VariantControlNode.js
var CLASS_NAME15 = "Simulink.VariantControl";
var MSG_INTEGER = "Simulink.VariantControl value must be an integer, logical, an enumeration, or a Simulink.Parameter with value of type integer, logical or enumeration.";
var MSG_SCALAR = "Simulink.VariantControl value must be a scalar or a Simulink.Parameter with scalar value.";
var VariantControlNode = class _VariantControlNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Value = props.Value !== void 0 ? props.Value : "";
  }
  get icon() {
    return "twoConnected_wsDefault";
  }
  get className() {
    return CLASS_NAME15;
  }
  get displayValue() {
    return PropValue.format(this.Value);
  }
  getProperties() {
    return [PropName, PropValue, PropDataType];
  }
  // PI layout: inherited BaseNode.getPILayout → buildPILayout drives the schema
  // "General" identity group (classes/variantControl.json).
  /**
   * Validate and apply a Value edit. MATLAB requires the Value to be an
   * integer-valued real scalar, a logical (true/false), or empty (''/'[]').
   * Our editor always delivers a string; we parse it and mirror the same
   * accept/reject logic MATLAB applies.
   */
  setProperty(propName2, stringValue) {
    if (propName2 !== "Value") {
      return super.setProperty(propName2, stringValue);
    }
    const validValue = PropValue.format(this.Value);
    const trimmed = stringValue.trim();
    if (trimmed === "" || trimmed === "''" || trimmed === "[]") {
      this.Value = trimmed === "[]" ? null : "";
      this._markModified();
      return true;
    }
    if (trimmed === "true" || trimmed === "false") {
      this.Value = trimmed === "true" ? true : false;
      this._markModified();
      return true;
    }
    if (/^-?Inf(inity)?$/i.test(trimmed) || /^NaN$/i.test(trimmed)) {
      return { error: true, reason: MSG_INTEGER, invalidValue: stringValue, validValue };
    }
    const num = Number(trimmed);
    if (Number.isNaN(num)) {
      return { error: true, reason: MSG_SCALAR, invalidValue: stringValue, validValue };
    }
    if (!Number.isFinite(num)) {
      return { error: true, reason: MSG_INTEGER, invalidValue: stringValue, validValue };
    }
    if (!Number.isInteger(num)) {
      return { error: true, reason: MSG_INTEGER, invalidValue: stringValue, validValue };
    }
    this.Value = num;
    this._markModified();
    return true;
  }
  // UNGATED: the Value is what the control selects with, so it is written whether or not
  // the file carried the key — including the empty one setProperty accepts above.
  _serializedOverrides() {
    return { Value: this.Value };
  }
  static get defaultName() {
    return "VariantControl";
  }
  // MEASURED from MATLAB R2027a: a default `Simulink.VariantControl` carries `Value: []` — the
  // empty DOUBLE — and a `ValueType` of 'Numeric'. We wrote `Value: ''` and no ValueType at all,
  // and the empty char is the wrong empty for a class whose setter above accepts only integers,
  // logicals and enumerations: MATLAB reads '' back as a 0x0 char, so the very first thing it
  // learns about a control we created is a type its own constructor would not have produced.
  static createDefault(name, parent) {
    const rawVal = _VariantControlNode._defaultRawVal(CLASS_NAME15, { Value: [], ValueType: "Numeric" });
    const props = _VariantControlNode._propsOf(rawVal);
    return new _VariantControlNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _VariantControlNode._propsOf(rawVal);
    return new _VariantControlNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/VariantBankNode.js
var CLASS_NAME16 = "Simulink.VariantBank";
var VariantBankNode = class _VariantBankNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Value = props.Value !== void 0 ? props.Value : "";
  }
  get icon() {
    return "wsParameters_bank";
  }
  get className() {
    return CLASS_NAME16;
  }
  get displayValue() {
    return PropValue.format(this.Value);
  }
  getProperties() {
    return [PropName, PropValue, PropDataType];
  }
  // PI layout: schema-driven "General" group (classes/variantBank.json).
  // UNGATED: the Value is what the bank IS, so it is written whether or not the file
  // carried the key.
  _serializedOverrides() {
    return { Value: this.Value };
  }
  static get defaultName() {
    return "VariantBank";
  }
  // A saveobj envelope, for the reason VariantVariableNode's carries one. MATLAB has no
  // `Value` property on this class at all, so the `{ Value: '' }` this used to write was pure
  // invention; under an envelope `_mergeProps` drops an empty override, so the
  // `_serializedOverrides` above now writes nothing until the user gives Value a value.
  // Fields, order and defaults measured from a MATLAB-written dictionary.
  static createDefault(name, parent) {
    const rawVal = _VariantBankNode._defaultCustomSaveRawVal(CLASS_NAME16, ["Name", "Description", "VariantConditions", "AllChoicesCoderInfo", "ActiveChoiceCoderInfo", "BankCoderInfo"], { Name: "", Description: "", VariantConditions: _VariantBankNode._emptyCell(), AllChoicesCoderInfo: "", ActiveChoiceCoderInfo: "", BankCoderInfo: "" });
    const props = _VariantBankNode._propsOf(rawVal);
    return new _VariantBankNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _VariantBankNode._propsOf(rawVal);
    return new _VariantBankNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/VariantBankCoderInfoNode.js
var CLASS_NAME17 = "Simulink.VariantBankCoderInfo";
var VariantBankCoderInfoNode = class _VariantBankCoderInfoNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Value = props.Value !== void 0 ? props.Value : "";
  }
  get icon() {
    return "wsParameters_bankCoderInfo";
  }
  get className() {
    return CLASS_NAME17;
  }
  get displayValue() {
    return PropValue.format(this.Value);
  }
  getProperties() {
    return [PropName, PropValue, PropDataType];
  }
  // PI layout: schema-driven "General" group (classes/variantBankCoderInfo.json).
  // UNGATED, as VariantBankNode's Value is.
  _serializedOverrides() {
    return { Value: this.Value };
  }
  static get defaultName() {
    return "VariantBankCoderInfo";
  }
  // A saveobj envelope, as VariantBankNode's is, and the invented `Value` goes the same way.
  // The only field here whose default is not empty is Qualifier, which MATLAB defaults to the
  // string 'None' — every field is a plain char, so this class's envelope is spelled
  // identically in both formats. Measured from a MATLAB-written dictionary.
  static createDefault(name, parent) {
    const rawVal = _VariantBankCoderInfoNode._defaultCustomSaveRawVal(CLASS_NAME17, ["HeaderFile", "DefinitionFile", "PreStatement", "PostStatement", "Qualifier"], { HeaderFile: "", DefinitionFile: "", PreStatement: "", PostStatement: "", Qualifier: "None" });
    const props = _VariantBankCoderInfoNode._propsOf(rawVal);
    return new _VariantBankCoderInfoNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _VariantBankCoderInfoNode._propsOf(rawVal);
    return new _VariantBankCoderInfoNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/CustomObjectNode.js
var CLASS_NAME18 = "CustomObject";
var CustomObjectNode = class _CustomObjectNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Description = props.Description || "";
  }
  get icon() {
    return OBJECT_ICON;
  }
  get className() {
    return CLASS_NAME18;
  }
  get displayValue() {
    return "<1x1 " + CLASS_NAME18 + ">";
  }
  getProperties() {
    return [PropName, PropValue, PropDataType, PropDescription];
  }
  // PI layout: schema-driven "General" group (classes/customObject.json).
  _serializedOverrides() {
    return this._gatedProps({ Description: this.Description });
  }
  static get defaultName() {
    return "CustomObject";
  }
  static createDefault(name, parent) {
    const rawVal = _CustomObjectNode._defaultRawVal(CLASS_NAME18);
    const props = _CustomObjectNode._propsOf(rawVal);
    return new _CustomObjectNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _CustomObjectNode._propsOf(rawVal);
    return new _CustomObjectNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ConfigSetRefNode.js
var CLASS_NAME19 = "Simulink.ConfigSetRef";
var ConfigSetRefNode = class _ConfigSetRefNode extends SimulinkObjectNode {
  // The reference's own `Name` property, a view of `name` for exactly the reasons
  // ConfigSetNode.ConfigName is one — and the fix for a defect MATLAB demonstrated rather
  // than one reasoned about. MATLAB requires an entry in the config section to be named the
  // same as its value's `Name`, and it enforces that by SILENTLY RENAMING THE ENTRY: a
  // dictionary where the Add gallery had written an entry called `ConfigSetRef` came back
  // from MATLAB holding one called `Reference`, because we wrote no `Name` at all and a
  // default-constructed `Simulink.ConfigSetRef` calls itself `Reference`. The user added one
  // entry and reopened the file to find a differently named one.
  get ConfigName() {
    return this.name;
  }
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.SourceName = props.SourceName || "";
    this.Description = props.Description || "";
  }
  get icon() {
    return this.active ? "check_configurationReference" : "configurationReference";
  }
  get className() {
    return CLASS_NAME19;
  }
  // A ConfigSetRef has no scalar "value" — the Value column is empty and not editable.
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropDataType, PropDescription];
  }
  // PI layout: schema-driven "General" group (classes/configSetRef.json).
  // SourceName is UNGATED, on the same terms as a ConfigSet's Name: a reference that cannot
  // say what it points at is not a reference, so the key is written even as the empty string
  // a half-built entry carries. Name is UNGATED for a stronger reason than fidelity — see
  // ConfigName above: omitting it is what let MATLAB rename the entry out from under us, and
  // writing a view of `name` is also what makes a RENAMED entry save under its new name
  // instead of reverting on reopen. Description is GATED — see
  // ConfigSetNode._serializedOverrides. Key order follows MATLAB's own declaration order for
  // this class (`SourceName` first, `Name` after the override cells), then the gated
  // description.
  _serializedOverrides() {
    return Object.assign({ SourceName: this.SourceName, Name: this.ConfigName }, this._gatedProps({ Description: this.Description }));
  }
  // MATLAB's own name for a default-constructed `Simulink.ConfigSetRef`, measured from the
  // `Name` property of one (`<P Name="Name" Class="char">Reference</P>`) rather than derived
  // from the class name. It has to BE that string: the entry name and the value's `Name` are
  // one string as far as MATLAB is concerned, so any other default would be renamed on the
  // first save by a MATLAB that disagrees.
  static get defaultName() {
    return "Reference";
  }
  static createDefault(name, parent) {
    const rawVal = _ConfigSetRefNode._defaultRawVal(CLASS_NAME19, { SourceName: "", Name: name || "Reference" });
    const props = _ConfigSetRefNode._propsOf(rawVal);
    return new _ConfigSetRefNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _ConfigSetRefNode._propsOf(rawVal);
    return new _ConfigSetRefNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/VariantConfigurationDataNode.js
var CLASS_NAME20 = "Simulink.VariantConfigurationData";
var VariantConfigurationDataNode = class _VariantConfigurationDataNode extends SimulinkObjectNode {
  constructor(name, parent, props, serial) {
    super(name, parent, serial);
    this.Value = props.Value !== void 0 ? props.Value : "";
  }
  get icon() {
    return "variantSettings";
  }
  // Report the real class identity from the parsed value (e.g. the container
  // is 'Simulink.VariantConfigurations'), falling back to the data class name.
  get className() {
    const raw = this.serial._rawVal;
    return raw && raw._array_class || CLASS_NAME20;
  }
  // A VariantConfiguration has no scalar "value" — the Value column is empty and not editable.
  get displayValue() {
    return "";
  }
  get valueEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropDataType];
  }
  // PI layout: schema-driven "General" group (classes/variantConfigurationData.json).
  // UNGATED, as VariantBankNode's Value is.
  _serializedOverrides() {
    return { Value: this.Value };
  }
  static get defaultName() {
    return "VariantConfigurationData";
  }
  // The one entry the Add gallery produced that MATLAB REFUSED to load, in both formats:
  // `SLDD:sldd:ValueClassNotAcceptedInSection`. Two separate reasons, both measured from a
  // dictionary MATLAB wrote.
  //
  // First the class, and this half is fidelity rather than correctness. MATLAB stores the
  // CONTAINER, `Simulink.VariantConfigurations`, and never
  // `Simulink.VariantConfigurationData`, which is the name of the DATA inside it —
  // `Simulink.VariantConfigurationData` is not even a constructible class in R2027a
  // (`Simulink.VariantConfigurationData` answers with a `Simulink.VariantConfigurations`).
  // Writing the container name is free on the way back in: `_array_class:
  // 'Simulink.VariantConfigurations'` already routes to this node (NodeClassMap, kindMap,
  // SectionNode, schema/index's alias), and `className` reads `_array_class` rather than
  // CLASS_NAME, so the entry we write reads back as itself.
  //
  // What the error was actually about is the SECTION, which is not in this file: an entry
  // of this class belongs to DESIGN data, and the gallery was adding it to the
  // Configurations section. Renaming the class alone did not move the refusal by a word —
  // probe7 got the same identifier back for `Simulink.VariantConfigurations` in
  // 'Configurations', in both formats — which is what pinned it on the section.
  // SectionNode's `design` list carries that account.
  //
  // Second the shape. This class custom-saves, so a property bag is not merely lower
  // fidelity but the wrong kind of thing — the same trap that segfaulted MATLAB for
  // `Simulink.VariantVariable` (see `_defaultCustomSaveRawVal`). `_fields` is MATLAB's
  // DECLARATION order, which is not the alphabetical order its text writer emits, and the
  // binary file is what states the four struct fields' own field names and their `1*0`
  // shape — the text writer flattens all four to `{"_type":"struct","_value":"[]"}` and
  // loses them. `_emptyStruct` keeps them, for the reason it documents: that spelling
  // round-trips through both of our writers, and MATLAB's lossier one does not survive our
  // binary path at all.
  //
  // `Version` is release-stamped ('27.1' as measured) rather than derived or omitted,
  // because it is the input to MATLAB's own migration: a file claiming the version whose
  // shape it actually has is the honest answer, an absent one reads as the oldest possible
  // format, and there is nothing in a text `.sldd` to derive a live release from.
  static createDefault(name, parent) {
    const rawVal = _VariantConfigurationDataNode._defaultCustomSaveRawVal("Simulink.VariantConfigurations", [
      "Configurations",
      "VariantConfigurations",
      "Constraints",
      "PreferredConfiguration",
      "DefaultConfigurationName",
      "DataDictionaryName",
      "DataDictionarySection",
      "AreSubModelConfigurationsMigrated",
      "ComponentConfigurationData",
      "Version"
    ], {
      Configurations: _VariantConfigurationDataNode._emptyStruct(["Name", "Description", "ControlVariables"], [1, 0]),
      VariantConfigurations: _VariantConfigurationDataNode._emptyStruct(["Name", "Description", "ControlVariables", "SubModelConfigurations"], [1, 0]),
      Constraints: _VariantConfigurationDataNode._emptyStruct(["Name", "Condition", "Description"], [1, 0]),
      PreferredConfiguration: "",
      DefaultConfigurationName: "",
      DataDictionaryName: "",
      DataDictionarySection: "",
      AreSubModelConfigurationsMigrated: true,
      ComponentConfigurationData: _VariantConfigurationDataNode._emptyStruct([
        "ConfigurationName",
        "ComponentName",
        "ComponentVariantConfigurationData",
        "ComponentConfigurationName",
        "ComponentControlVariablesInfo"
      ], [1, 0]),
      Version: "27.1"
    });
    const props = _VariantConfigurationDataNode._propsOf(rawVal);
    return new _VariantConfigurationDataNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
  static parse(rawVal, name, parent) {
    const props = _VariantConfigurationDataNode._propsOf(rawVal);
    return new _VariantConfigurationDataNode(name, parent, props, { _rawVal: rawVal, _properties: props });
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/NodeClassMap.js
var CLASS_MAP = {
  "MatlabVariable": MatlabVariableNode,
  // A Constant is a derived MATLAB variable; registering it lets Architectural
  // Data offer "Add Constant" directly (addEntry('Constant') → a scalar Constant).
  "Constant": ConstantNode,
  "MatlabStruct": StructNode,
  "Simulink.Parameter": ParameterNode,
  // mpt.Parameter and mpt.Signal are the Embedded Coder subclasses of the two
  // classes above, and they are everywhere in production dictionaries: MPT
  // ("module packaging tool") is what a project switches to the moment it needs
  // custom storage classes and memory sections for code generation. A subclass
  // presents every property its superclass does, so it needs the superclass's
  // node and not one of its own — sharing the class rather than copying it is
  // also what keeps the two from drifting apart as the Parameter/Signal nodes
  // grow. The node reports the class it actually read (see ParameterNode's
  // className), so a user still sees `mpt.Parameter` in the Class column; only
  // the TREATMENT is inherited.
  //
  // Deliberately NOT added to any section's ALLOWED_TYPES: these are classes we
  // READ, not classes we offer to create. Nothing in the read path consults that
  // list — a parsed entry lands in a section by its metadata namespace — while
  // offering "Add mpt.Parameter" would mean claiming we write a well-formed
  // mpt object from scratch, which the MATLAB round-trip gate has never checked.
  "mpt.Parameter": ParameterNode,
  "Simulink.LookupTable": LookupTableNode,
  "Simulink.Breakpoint": BreakpointNode,
  "Simulink.Signal": SignalNode,
  "mpt.Signal": SignalNode,
  "Simulink.Bus": BusNode,
  "Simulink.ConnectionBus": ConnectionBusNode,
  "Simulink.ServiceBus": ServiceBusNode,
  "Simulink.NumericType": NumericTypeNode,
  "Simulink.AliasType": AliasTypeNode,
  "Simulink.ValueType": ValueTypeNode,
  "Simulink.data.dictionary.EnumTypeDefinition": EnumTypeNode,
  "Simulink.VariantExpression": VariantExpressionNode,
  "Simulink.VariantControl": VariantControlNode,
  "Simulink.VariantVariable": VariantVariableNode,
  "Simulink.VariantBank": VariantBankNode,
  "Simulink.VariantBankCoderInfo": VariantBankCoderInfoNode,
  "CustomObject": CustomObjectNode,
  "Simulink.ConfigSet": ConfigSetNode,
  "Simulink.ConfigSetRef": ConfigSetRefNode,
  "Simulink.VariantConfigurationData": VariantConfigurationDataNode,
  "Simulink.VariantConfigurations": VariantConfigurationDataNode
};
function asObject(val) {
  return val !== null && typeof val === "object" ? val : null;
}
var STRUCTURAL_PARSERS = [
  { matcher: (val) => Array.isArray(val) && val.length > 0 && val.every((el) => typeof el === "string"), NodeClass: MatlabVariableNode },
  { matcher: (val) => asObject(val)?._array_type === "String", NodeClass: MatlabVariableNode },
  { matcher: (val) => asObject(val)?._array_type === "Struct", NodeClass: StructNode },
  { matcher: (val) => asObject(val)?._array_type === "Cell", NodeClass: MatlabVariableNode },
  { matcher: (val) => {
    const o = asObject(val);
    return !!o && !!o._type && typeof o._value === "string" && o._value.indexOf("Matrix(") === 0;
  }, NodeClass: MatlabVariableNode },
  { matcher: (val) => Array.isArray(val), NodeClass: MatlabVariableNode },
  { matcher: (val) => !!asObject(val)?._array_class, NodeClass: ObjectNode },
  { matcher: (val) => !!asObject(val)?._object_class, NodeClass: ObjectNode },
  { matcher: (val) => val === null || val === void 0 || typeof val === "number" || typeof val === "boolean" || typeof val === "string", NodeClass: MatlabVariableNode }
];
function getClass2(className) {
  return CLASS_MAP[className] || null;
}
function parseValue2(rawVal, name, parent) {
  const obj = asObject(rawVal);
  if (obj && obj._array_class) {
    const elements = obj._elements || [];
    if (elements.length > 1) {
      return ObjectNode.parse(obj, name, parent);
    }
    const NodeClass = CLASS_MAP[obj._array_class];
    if (NodeClass) {
      return NodeClass.parse(rawVal, name, parent);
    }
  }
  for (const { matcher, NodeClass } of STRUCTURAL_PARSERS) {
    if (matcher(rawVal)) {
      return NodeClass.parse(rawVal, name, parent);
    }
  }
  return MatlabVariableNode.parse(rawVal, name, parent);
}
function getRegisteredClasses2() {
  return Object.keys(CLASS_MAP);
}
function wrapDerivedVariable2(node) {
  if (node.constructor === MatlabVariableNode && !node._isOpaque) {
    return ConstantNode.fromVariable(node);
  }
  return node;
}
var api = { getClass: getClass2, parseValue: parseValue2, getRegisteredClasses: getRegisteredClasses2, wrapDerivedVariable: wrapDerivedVariable2 };
init(api);

// node_modules/data-explorer-core/dist/core/EventBus.js
function createEventBus() {
  const listeners = {};
  function publish2(topic, ...args) {
    const entries = listeners[topic];
    if (!entries) {
      return;
    }
    for (const entry of entries.slice()) {
      try {
        entry.fn(...args);
      } catch (err2) {
        console.error(`EventBus: listener for "${String(topic)}" threw`, err2);
      }
    }
  }
  function subscribe2(topic, fn) {
    if (!listeners[topic]) {
      listeners[topic] = [];
    }
    const entries = listeners[topic];
    const entry = { fn };
    entries.push(entry);
    return {
      remove() {
        const current = listeners[topic];
        if (!current) {
          return;
        }
        const at = current.indexOf(entry);
        if (at !== -1) {
          current.splice(at, 1);
        }
      }
    };
  }
  function clear2() {
    Object.keys(listeners).forEach((k) => delete listeners[k]);
  }
  return { publish: publish2, subscribe: subscribe2, clear: clear2 };
}
var defaultBus = createEventBus();

// node_modules/data-explorer-core/dist/core/UndoManager.js
function createUndoManager(bus) {
  const stacks = /* @__PURE__ */ new Map();
  function getStack(srcId) {
    if (!stacks.has(srcId)) {
      stacks.set(srcId, { undo: [], redo: [] });
    }
    return stacks.get(srcId);
  }
  function execute2(srcId, command) {
    command.execute();
    const stack = getStack(srcId);
    stack.undo.push(command);
    stack.redo = [];
    bus.publish("undo/changed", { srcId });
  }
  function pushExecuted2(srcId, command) {
    const stack = getStack(srcId);
    stack.undo.push(command);
    stack.redo = [];
    bus.publish("undo/changed", { srcId });
  }
  function undo2(srcId) {
    const stack = getStack(srcId);
    if (stack.undo.length === 0) {
      return;
    }
    const command = stack.undo.pop();
    command.undo();
    stack.redo.push(command);
    bus.publish("undo/changed", { srcId });
  }
  function redo2(srcId) {
    const stack = getStack(srcId);
    if (stack.redo.length === 0) {
      return;
    }
    const command = stack.redo.pop();
    command.execute();
    stack.undo.push(command);
    bus.publish("undo/changed", { srcId });
  }
  function canUndo2(srcId) {
    if (!srcId || !stacks.has(srcId)) {
      return false;
    }
    return stacks.get(srcId).undo.length > 0;
  }
  function canRedo2(srcId) {
    if (!srcId || !stacks.has(srcId)) {
      return false;
    }
    return stacks.get(srcId).redo.length > 0;
  }
  function clear2(srcId) {
    if (srcId) {
      stacks.delete(srcId);
    } else {
      stacks.clear();
    }
    bus.publish("undo/changed", { srcId: srcId || "" });
  }
  bus.subscribe("datamodel/source-removed", (evt) => {
    clear2(evt.srcId);
  });
  bus.subscribe("datamodel/cleared", () => {
    clear2();
  });
  return { execute: execute2, pushExecuted: pushExecuted2, undo: undo2, redo: redo2, canUndo: canUndo2, canRedo: canRedo2, clear: clear2 };
}
var defaultUndoManager = createUndoManager(defaultBus);
var execute = defaultUndoManager.execute;
var pushExecuted = defaultUndoManager.pushExecuted;
var undo = defaultUndoManager.undo;
var redo = defaultUndoManager.redo;
var canUndo = defaultUndoManager.canUndo;
var canRedo = defaultUndoManager.canRedo;
var clear = defaultUndoManager.clear;

// node_modules/data-explorer-core/dist/datamodel/node/ContainerNode.js
var ContainerNode = class extends BaseNode {
  get isContainer() {
    return true;
  }
  get tableColumnConfig() {
    return { columns: ["Name", "Value", "DataType", "Status", "UsedBy"] };
  }
  toRow() {
    return null;
  }
  flatten() {
    const result = [];
    const stack = [];
    for (let i = this.children.length - 1; i >= 0; i--) {
      stack.push(this.children[i]);
    }
    while (stack.length > 0) {
      const node = stack.pop();
      result.push(node);
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
    return result;
  }
};

// node_modules/data-explorer-core/dist/datamodel/parser/ScCatalog.js
var SC_PART = "simulink/systemcomposer/interfaceDictionary";
var SC_PART_XML = `${SC_PART}.xml`;
var SC_TYPE_TO_CLASSIFICATION = {
  "systemcomposer.architecture.model.interface.CompositeDataInterface": "DataInterface",
  "systemcomposer.architecture.model.interface.CompositePhysicalInterface": "PhysicalInterface",
  "systemcomposer.architecture.model.swarch.ServiceInterface": "ServiceInterface",
  "systemcomposer.architecture.model.interface.ValueTypeInterface": "ValueType",
  "systemcomposer.property.StructDataType": "StructType",
  "systemcomposer.property.NumericType": "NumericType",
  "systemcomposer.property.EnumDataType": "EnumType",
  "systemcomposer.property.AliasType": "AliasType"
};
function classificationOf(catalog, entryName) {
  if (!catalog) {
    return null;
  }
  const scType = catalog.interfaces[entryName] || catalog.modeledDataTypes[entryName];
  return scType && SC_TYPE_TO_CLASSIFICATION[scType] || null;
}
function renameInCatalog(catalog, oldName, newName) {
  if (!catalog || oldName === newName) {
    return false;
  }
  let moved = false;
  [catalog.interfaces, catalog.modeledDataTypes].forEach((bag) => {
    if (!Object.prototype.hasOwnProperty.call(bag, oldName)) {
      return;
    }
    bag[newName] = bag[oldName];
    delete bag[oldName];
    moved = true;
  });
  return moved;
}

// node_modules/data-explorer-core/dist/datamodel/SectionConstants.js
var NS_DESIGN = "dacaf35e-55a5-454d-a7c1-93db038a210e";
var NS_CONFIGURATIONS = "a3b2532e-8e6e-47f5-94fb-b15daf666a84";
var NS_OTHER = "42516768-0ace-4981-8ac7-0a9b32cba471";
var SECTION_NAMESPACE = {
  design: NS_DESIGN,
  arch: NS_DESIGN,
  config: NS_CONFIGURATIONS,
  other: NS_OTHER
};
function getSectionKey(meta) {
  const ns = meta.namespace || "";
  const isDerived = meta.isderived === "1";
  if (ns === NS_DESIGN && isDerived) {
    return "arch";
  }
  if (ns === NS_DESIGN) {
    return "design";
  }
  if (ns === NS_CONFIGURATIONS) {
    return "config";
  }
  if (ns === NS_OTHER) {
    return "other";
  }
  return "design";
}

// node_modules/data-explorer-core/dist/datamodel/node/container/SectionNode.js
var ALLOWED_TYPES = {
  design: [
    "MatlabVariable",
    "MatlabStruct",
    "Simulink.Parameter",
    "Simulink.LookupTable",
    "Simulink.Breakpoint",
    "Simulink.Signal",
    "Simulink.Bus",
    "Simulink.ConnectionBus",
    "Simulink.NumericType",
    "Simulink.AliasType",
    "Simulink.ValueType",
    "Simulink.data.dictionary.EnumTypeDefinition",
    "Simulink.VariantExpression",
    "Simulink.VariantControl",
    "Simulink.VariantVariable",
    "Simulink.VariantBank",
    "Simulink.VariantBankCoderInfo",
    // Variant configuration data is DESIGN data, both spellings of it, and that is
    // MATLAB's rule rather than a preference. It reads like configuration — it is what the
    // Variant Manager edits — and it used to be listed under `config` for that reason, at
    // which MATLAB refused the entry outright in BOTH formats:
    //   SLDD:sldd:ValueClassNotAcceptedInSection
    //   Values of class 'Simulink.VariantConfigurations' are not supported in the
    //   'Configurations' section of the dictionary.
    // The error names the SECTION, and that is the whole of it: a dictionary MATLAB wrote
    // carries its own `Simulink.VariantConfigurations` entry in the design namespace with
    // `IsDerived` 0, beside the Parameters and Buses, and `addEntry` into 'Design Data' is
    // what MATLAB itself accepts. The class name and the saveobj envelope were already
    // right — they match those bytes field for field — so nothing about the VALUE was ever
    // the problem, and moving the two names here is the fix. The Configurations section
    // takes a ConfigSet and a ConfigSetRef, and nothing else.
    "Simulink.VariantConfigurationData",
    "Simulink.VariantConfigurations",
    "CustomObject"
  ],
  arch: [
    "Constant",
    // No Simulink.Signal: a signal is design data. Architectural data models
    // interfaces, and its bus/connection-bus entries are the interface types.
    "Simulink.Bus",
    "Simulink.ConnectionBus",
    "Simulink.ServiceBus",
    "Simulink.data.dictionary.EnumTypeDefinition",
    "Simulink.AliasType",
    // Architectural data models value types and numeric types too (a ValueType
    // interface and a modeled NumericType both live in arch — see the fixture).
    "Simulink.ValueType",
    "Simulink.NumericType"
  ],
  // Two classes, measured: MATLAB accepts a ConfigSet and a ConfigSetRef here and refuses
  // everything else by name. See the variant-configuration note in `design` above for the
  // one that looked like it belonged here and does not.
  config: ["Simulink.ConfigSet", "Simulink.ConfigSetRef"],
  other: ["MatlabVariable", "Simulink.VariantExpression", "Simulink.VariantVariable", "CustomObject"]
};
function generateUuid() {
  const hex = "0123456789abcdef";
  const segments = [8, 4, 4, 4, 12];
  return segments.map(function(len) {
    let s = "";
    for (let i = 0; i < len; i++) {
      s += hex[Math.floor(Math.random() * 16)];
    }
    return s;
  }).join("-");
}
var SectionNode = class extends ContainerNode {
  constructor(name, parent, label, iconId) {
    super(name, parent);
    this.label = label;
    this.iconId = iconId;
  }
  get icon() {
    return this.iconId;
  }
  get displayName() {
    return this.label;
  }
  get tableColumnConfig() {
    if (this.name === "config") {
      return { columns: ["Name", "Description", "Status"] };
    }
    return { columns: ["Name", "Value", "DataType", "Status", "UsedBy"] };
  }
  getAllowedTypes() {
    return ALLOWED_TYPES[this.name] || [];
  }
  // Whether an entry of `className` may live in this section. An empty allow-list
  // means "no restriction". This is the ONE gate: addEntry calls it too (rather
  // than re-testing the list inline), so the host's paste/drop pre-check can never
  // drift from what addEntry actually permits.
  allowsType(className) {
    const allowed = this.getAllowedTypes();
    return allowed.length === 0 || allowed.indexOf(className) !== -1;
  }
  // Every entry name that shares this section's namespace, across all sibling
  // sections. Design and Architectural Data both live in NS_DESIGN, so they
  // share one flat name space — a paste into either must avoid colliding with
  // names in the other. Falls back to this section's own children when the
  // section is detached or its namespace is unknown.
  _namespaceEntryNames() {
    const myNs = SECTION_NAMESPACE[this.name];
    const siblings = this.parent?.children ?? null;
    if (!myNs || !siblings) {
      return this.children.map((c) => c.name);
    }
    const names = [];
    for (const s of siblings) {
      if (SECTION_NAMESPACE[s.name] === myNs) {
        for (const c of s.children) {
          names.push(c.name);
        }
      }
    }
    return names;
  }
  // One of MY entries was renamed — follow it wherever else the dictionary spells that
  // name. Today that is the System Composer catalog, which keys its definitions by
  // entry name and so decides an architectural entry's Kind by it: a catalog left
  // holding the old name reclassifies the entry (a struct type re-reads as a plain data
  // interface) the next time anything rebuilds it from a record.
  //
  // Called by DataNode.setProperty for the same reason `_renameField` is: a rename is
  // only complete when every structure keyed by the name has been told, and only the
  // parent knows which those are. Nested children (bus elements, struct fields) have no
  // such parent, which is what keeps an element that happens to share a definition's
  // name from moving the catalog under the entry that really carries it.
  _entryRenamed(oldName, newName) {
    const dictionary = this.parent;
    renameInCatalog(dictionary?.systemComposer, oldName, newName);
  }
  addEntry(className, entryName) {
    const NodeClass = getClass(className);
    if (!NodeClass || !NodeClass.createDefault) {
      return null;
    }
    if (!this.allowsType(className)) {
      return null;
    }
    const baseName = entryName || NodeClass.defaultName;
    const uniqueName = this._uniqueName(baseName);
    const node = NodeClass.createDefault(uniqueName, this);
    node.metadata = {
      uuid: generateUuid(),
      namespace: SECTION_NAMESPACE[this.name] || NS_OTHER,
      lastmod: matlabTimestampNow(),
      modifiedby: "",
      isderived: this.name === "arch" ? "1" : "0"
    };
    node.status = "New";
    this.addChild(node);
    this._markSourceDirty();
    return node;
  }
  execAddEntry(className, entryName) {
    const node = this.addEntry(className, entryName);
    if (!node) {
      return null;
    }
    const index = this.children.indexOf(node);
    return {
      node,
      undo: () => {
        this.removeChild(node);
      },
      redo: () => {
        this.addChild(node, index);
      }
    };
  }
  execRemoveEntry(node) {
    const index = this.children.indexOf(node);
    if (index < 0) {
      return null;
    }
    this.removeChild(node);
    this._markSourceDirty();
    return {
      undo: () => {
        this.addChild(node, index);
      },
      redo: () => {
        this.removeChild(node);
      }
    };
  }
  _uniqueName(baseName) {
    const existing = new Set(this._namespaceEntryNames());
    if (!existing.has(baseName)) {
      return baseName;
    }
    let i = 1;
    while (existing.has(baseName + i)) {
      i++;
    }
    return baseName + i;
  }
  // Always returns a node: parseValue's matcher chain falls through to
  // MatlabVariableNode for any shape it does not recognize, so an unfamiliar value
  // still models as something rather than dropping the entry out of the file.
  parseEntry(rawEntry, systemComposer) {
    const entryName = rawEntry.name || "";
    let dataNode = parseValue(rawEntry.value, entryName, this);
    dataNode.metadata = rawEntry.metadata || null;
    if (rawEntry.rawXml) {
      dataNode.rawXml = rawEntry.rawXml;
    }
    if (dataNode.isDerived) {
      dataNode = wrapDerivedVariable(dataNode);
    }
    const classification = classificationOf(systemComposer, entryName);
    if (classification) {
      dataNode.classification = classification;
      if (classification === "StructType") {
        dataNode.isStructType = true;
      }
    }
    this.addChild(dataNode);
    return dataNode;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropRelease.js
var PropRelease = class {
  static {
    this.key = "Release";
  }
  static {
    this.displayName = "Release";
  }
  static {
    this.editor = "label";
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropFileFormat.js
var PropFileFormat = class {
  static {
    this.key = "FileFormat";
  }
  static {
    this.displayName = "File Format";
  }
  static {
    this.editor = "label";
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropNumberOfEntries.js
var PropNumberOfEntries = class {
  static {
    this.key = "NumberOfEntries";
  }
  static {
    this.displayName = "Number of Entries";
  }
  static {
    this.editor = "label";
  }
  static format(value) {
    return String(value || 0);
  }
};

// node_modules/fast-xml-parser/src/util.js
var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
var regexName = new RegExp("^" + nameRegexp + "$");
function getAllMatches(string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    allmatches.startIndex = regex.lastIndex - match[0].length;
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
}
var isName = function(string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === "undefined");
};
function isExist(v) {
  return typeof v !== "undefined";
}
var DANGEROUS_PROPERTY_NAMES = [
  // '__proto__',
  // 'constructor',
  // 'prototype',
  "hasOwnProperty",
  "toString",
  "valueOf",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__"
];
var criticalProperties = ["__proto__", "constructor", "prototype"];

// node_modules/fast-xml-parser/src/validator.js
var defaultOptions = {
  allowBooleanAttributes: false,
  //A tag can have attributes without any value
  unpairedTags: []
};
function validate(xmlData, options) {
  options = Object.assign({}, defaultOptions, options);
  const tags = [];
  let tagFound = false;
  let reachedRoot = false;
  if (xmlData[0] === "\uFEFF") {
    xmlData = xmlData.substr(1);
  }
  for (let i = 0; i < xmlData.length; i++) {
    if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
      i += 2;
      i = readPI(xmlData, i);
      if (i.err) return i;
    } else if (xmlData[i] === "<") {
      let tagStartPos = i;
      i++;
      if (xmlData[i] === "!") {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === "/") {
          closingTag = true;
          i++;
        }
        let tagName = "";
        for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        if (tagName[tagName.length - 1] === "/") {
          tagName = tagName.substring(0, tagName.length - 1);
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "Invalid space after '<'.";
          } else {
            msg = "Tag '" + tagName + "' is an invalid name.";
          }
          return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
        }
        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;
        if (attrStr[attrStr.length - 1] === "/") {
          const attrStrStart = i - attrStr.length;
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid = validateAttributeString(attrStr, options);
          if (isValid === true) {
            tagFound = true;
          } else {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
          } else if (tags.length === 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
          } else {
            const otg = tags.pop();
            if (tagName !== otg.tagName) {
              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
              return getErrorObject(
                "InvalidTag",
                "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                getLineNumberForPosition(xmlData, tagStartPos)
              );
            }
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid = validateAttributeString(attrStr, options);
          if (isValid !== true) {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
          }
          if (reachedRoot === true) {
            return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
          } else if (options.unpairedTags.indexOf(tagName) !== -1) {
          } else {
            tags.push({ tagName, tagStartPos });
          }
          tagFound = true;
        }
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            if (xmlData[i + 1] === "!") {
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else if (xmlData[i + 1] === "?") {
              i = readPI(xmlData, ++i);
              if (i.err) return i;
            } else {
              break;
            }
          } else if (xmlData[i] === "&") {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          } else {
            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
              return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
            }
          }
        }
        if (xmlData[i] === "<") {
          i--;
        }
      }
    } else {
      if (isWhiteSpace(xmlData[i])) {
        continue;
      }
      return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }
  if (!tagFound) {
    return getErrorObject("InvalidXml", "Start tag expected.", 1);
  } else if (tags.length == 1) {
    return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
  } else if (tags.length > 0) {
    return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  }
  return true;
}
function isWhiteSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
function readPI(xmlData, i) {
  const start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == "?" || xmlData[i] == " ") {
      const tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === "xml") {
        return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}
function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "<") {
        angleBracketsCount++;
      } else if (xmlData[i] === ">") {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  }
  return i;
}
var doubleQuote = '"';
var singleQuote = "'";
function readAttributeStr(xmlData, i) {
  let attrStr = "";
  let startChar = "";
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === "") {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) {
      } else {
        startChar = "";
      }
    } else if (xmlData[i] === ">") {
      if (startChar === "") {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== "") {
    return false;
  }
  return {
    value: attrStr,
    index: i,
    tagClosed
  };
}
function scanAttributeTokens(attrStr) {
  const tokens = [];
  const len = attrStr.length;
  let i = 0;
  while (i < len) {
    const tokenStart = i;
    while (i < len && isWhiteSpace(attrStr[i])) i++;
    if (i >= len) break;
    if (attrStr[i] === "=") {
      i = tokenStart + 1;
      continue;
    }
    const leadingWs = attrStr.slice(tokenStart, i);
    const nameStart = i;
    while (i < len && !isWhiteSpace(attrStr[i]) && attrStr[i] !== "=") i++;
    const name = attrStr.slice(nameStart, i);
    let equalsGroup;
    let j = i;
    while (j < len && isWhiteSpace(attrStr[j])) j++;
    if (j < len && attrStr[j] === "=") {
      equalsGroup = attrStr.slice(i, j + 1);
      i = j + 1;
    }
    let quoteChar;
    let value;
    let k = i;
    while (k < len && isWhiteSpace(attrStr[k])) k++;
    if (k < len && (attrStr[k] === '"' || attrStr[k] === "'")) {
      const valueStart = k + 1;
      const closeIdx = attrStr.indexOf(attrStr[k], valueStart);
      if (closeIdx !== -1) {
        quoteChar = attrStr[k];
        value = attrStr.slice(valueStart, closeIdx);
        i = closeIdx + 1;
      }
    }
    const token = { startIndex: tokenStart };
    token[1] = leadingWs;
    token[2] = name;
    token[3] = equalsGroup;
    token[4] = quoteChar !== void 0 ? true : void 0;
    token[5] = quoteChar;
    token[6] = value;
    tokens.push(token);
  }
  return tokens;
}
function validateAttributeString(attrStr, options) {
  const matches = scanAttributeTokens(attrStr);
  const attrNames = {};
  for (let i = 0; i < matches.length; i++) {
    if (matches[i][1].length === 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
      return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
    }
    const attrName = matches[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
    }
    if (!Object.prototype.hasOwnProperty.call(attrNames, attrName)) {
      attrNames[attrName] = 1;
    } else {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
    }
  }
  return true;
}
function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === "x") {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ";")
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}
function validateAmpersand(xmlData, i) {
  i++;
  if (xmlData[i] === ";")
    return -1;
  if (xmlData[i] === "#") {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ";")
      break;
    return -1;
  }
  return i;
}
function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code,
      msg: message,
      line: lineNumber.line || lineNumber,
      col: lineNumber.col
    }
  };
}
function validateAttrName(attrName) {
  return isName(attrName);
}
function validateTagName(tagname) {
  return isName(tagname);
}
function getLineNumberForPosition(xmlData, index) {
  const lines = xmlData.substring(0, index).split(/\r?\n/);
  return {
    line: lines.length,
    // column number is last line's length + 1, because column numbering starts at 1:
    col: lines[lines.length - 1].length + 1
  };
}
function getPositionFromMatch(match) {
  return match.startIndex + match[1].length;
}

// node_modules/@nodable/entities/src/entities.js
var CURRENCY = {
  cent: "\xA2",
  pound: "\xA3",
  curren: "\xA4",
  yen: "\xA5",
  euro: "\u20AC",
  dollar: "$",
  fnof: "\u0192",
  inr: "\u20B9",
  af: "\u060B",
  birr: "\u1265\u122D",
  peso: "\u20B1",
  rub: "\u20BD",
  won: "\u20A9",
  yuan: "\xA5",
  cedil: "\xB8"
};
var XML = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"'
};
var COMMON_HTML = {
  nbsp: "\xA0",
  copy: "\xA9",
  reg: "\xAE",
  trade: "\u2122",
  mdash: "\u2014",
  ndash: "\u2013",
  hellip: "\u2026",
  laquo: "\xAB",
  raquo: "\xBB",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  bull: "\u2022",
  para: "\xB6",
  sect: "\xA7",
  deg: "\xB0",
  frac12: "\xBD",
  frac14: "\xBC",
  frac34: "\xBE"
};

// node_modules/@nodable/entities/src/EntityDecoder.js
var ENTITY_ACTION = Object.freeze({
  /** Resolve and expand the entity normally. */
  ALLOW: "allow",
  /** Silently skip this entity — it will not be registered. */
  BLOCK: "block",
  /** Throw an error, aborting entity registration entirely. */
  THROW: "throw"
});
var SPECIAL_CHARS = new Set("!?\\\\/[]$%{}^&*()<>|+");
function validateEntityName(name) {
  if (name[0] === "#") {
    throw new Error(`[EntityReplacer] Invalid character '#' in entity name: "${name}"`);
  }
  for (const ch of name) {
    if (SPECIAL_CHARS.has(ch)) {
      throw new Error(`[EntityReplacer] Invalid character '${ch}' in entity name: "${name}"`);
    }
  }
  return name;
}
function mergeEntityMaps(...maps) {
  const out = /* @__PURE__ */ Object.create(null);
  for (const map of maps) {
    if (!map) continue;
    for (const key of Object.keys(map)) {
      const raw = map[key];
      if (typeof raw === "string") {
        out[key] = raw;
      } else if (raw && typeof raw === "object" && raw.val !== void 0) {
        const val = raw.val;
        if (typeof val === "string") {
          out[key] = val;
        }
      }
    }
  }
  return out;
}
var LIMIT_TIER_EXTERNAL = "external";
var LIMIT_TIER_BASE = "base";
var LIMIT_TIER_ALL = "all";
function parseLimitTiers(raw) {
  if (!raw || raw === LIMIT_TIER_EXTERNAL) return /* @__PURE__ */ new Set([LIMIT_TIER_EXTERNAL]);
  if (raw === LIMIT_TIER_ALL) return /* @__PURE__ */ new Set([LIMIT_TIER_ALL]);
  if (raw === LIMIT_TIER_BASE) return /* @__PURE__ */ new Set([LIMIT_TIER_BASE]);
  if (Array.isArray(raw)) return new Set(raw);
  return /* @__PURE__ */ new Set([LIMIT_TIER_EXTERNAL]);
}
var NCR_LEVEL = Object.freeze({ allow: 0, leave: 1, remove: 2, throw: 3 });
var XML10_ALLOWED_C0 = /* @__PURE__ */ new Set([9, 10, 13]);
function parseNCRConfig(ncr) {
  if (!ncr) {
    return { xmlVersion: 1, onLevel: NCR_LEVEL.allow, nullLevel: NCR_LEVEL.remove };
  }
  const xmlVersion = ncr.xmlVersion === 1.1 ? 1.1 : 1;
  const onLevel = NCR_LEVEL[ncr.onNCR] ?? NCR_LEVEL.allow;
  const nullLevel = NCR_LEVEL[ncr.nullNCR] ?? NCR_LEVEL.remove;
  const clampedNull = Math.max(nullLevel, NCR_LEVEL.remove);
  return { xmlVersion, onLevel, nullLevel: clampedNull };
}
var EntityDecoder = class {
  /**
   * @param {object} [options]
   * @param {object|null}  [options.namedEntities]        — extra named entities merged into base map
   * @param {object}  [options.limit]                 — security limits
   * @param {number}       [options.limit.maxTotalExpansions=0]  — 0 = unlimited
   * @param {number}       [options.limit.maxExpandedLength=0]   — 0 = unlimited
   * @param {'external'|'base'|'all'|string[]} [options.limit.applyLimitsTo='external']
   *   Which entity tiers count against the security limits:
   *   - 'external' (default) — only input/runtime + persistent external entities
   *   - 'base'               — only DEFAULT_XML_ENTITIES + namedEntities
   *   - 'all'                — every entity regardless of tier
   *   - string[]             — explicit combination, e.g. ['external', 'base']
   * @param {((resolved: string, original: string) => string)|null} [options.postCheck=null]
   * @param {string[]} [options.remove=[]] — entity names (e.g. ['nbsp', '#13']) to delete (replace with empty string)
   * @param {string[]} [options.leave=[]]  — entity names to keep as literal (unchanged in output)
   * @param {object}   [options.ncr]       — Numeric Character Reference controls
   * @param {1.0|1.1}  [options.ncr.xmlVersion=1.0]
   *   XML version governing which codepoint ranges are restricted:
   *   - 1.0 — C0 controls U+0001–U+001F (except U+0009/000A/000D) are prohibited
   *   - 1.1 — C0 controls are allowed when written as NCRs; C1 (U+007F–U+009F) decoded as-is
   * @param {'allow'|'leave'|'remove'|'throw'} [options.ncr.onNCR='allow']
   *   Base action for numeric references. Severity order: allow < leave < remove < throw.
   *   For codepoint ranges that carry a minimum level (surrogates → remove, XML 1.0 C0 → remove),
   *   the effective action is max(onNCR, rangeMinimum).
   * @param {'remove'|'throw'} [options.ncr.nullNCR='remove']
   *   Action for U+0000 (null). 'allow' and 'leave' are clamped to 'remove' since null is never safe.
   * @param {((name: string, value: string) => 'allow'|'block'|'throw')|null} [options.onExternalEntity=null]
   *   Hook called when an external entity is registered via `setExternalEntities()` or
   *   `addExternalEntity()`. Return `ENTITY_ACTION.ALLOW` to accept the entity,
   *   `ENTITY_ACTION.BLOCK` to silently skip it, or `ENTITY_ACTION.THROW` to abort with an error.
   * @param {((name: string, value: string) => 'allow'|'block'|'throw')|null} [options.onInputEntity=null]
   *   Hook called when an input entity is registered via `addInputEntities()`. Return
   *   `ENTITY_ACTION.ALLOW` to accept, `ENTITY_ACTION.BLOCK` to silently skip, or
   *   `ENTITY_ACTION.THROW` to abort with an error.
   */
  constructor(options = {}) {
    this._limit = options.limit || {};
    this._maxTotalExpansions = this._limit.maxTotalExpansions || 0;
    this._maxExpandedLength = this._limit.maxExpandedLength || 0;
    this._postCheck = typeof options.postCheck === "function" ? options.postCheck : (r) => r;
    this._limitTiers = parseLimitTiers(this._limit.applyLimitsTo ?? LIMIT_TIER_EXTERNAL);
    this._numericAllowed = options.numericAllowed ?? true;
    this._baseMap = mergeEntityMaps(XML, options.namedEntities || null);
    this._externalMap = /* @__PURE__ */ Object.create(null);
    this._inputMap = /* @__PURE__ */ Object.create(null);
    this._totalExpansions = 0;
    this._expandedLength = 0;
    this._removeSet = new Set(options.remove && Array.isArray(options.remove) ? options.remove : []);
    this._leaveSet = new Set(options.leave && Array.isArray(options.leave) ? options.leave : []);
    const ncrCfg = parseNCRConfig(options.ncr);
    this._ncrXmlVersion = ncrCfg.xmlVersion;
    this._ncrOnLevel = ncrCfg.onLevel;
    this._ncrNullLevel = ncrCfg.nullLevel;
    this._onExternalEntity = typeof options.onExternalEntity === "function" ? options.onExternalEntity : null;
    this._onInputEntity = typeof options.onInputEntity === "function" ? options.onInputEntity : null;
  }
  // -------------------------------------------------------------------------
  // Private: registration hook dispatch
  // -------------------------------------------------------------------------
  /**
   * Invoke a registration hook for a single entity name/value pair.
   * Returns true when the entity should be accepted, false when it should be
   * silently skipped (BLOCK), and throws when the hook returns THROW.
   *
   * @param {((name: string, value: string) => 'allow'|'block'|'throw')|null} hook
   * @param {string} name
   * @param {string} value
   * @param {string} context  — used in error messages ('external' | 'input')
   * @returns {boolean}  true = accept, false = skip
   */
  _applyRegistrationHook(hook, name, value, context) {
    if (!hook) return true;
    const action = hook(name, value);
    if (action === ENTITY_ACTION.BLOCK) return false;
    if (action === ENTITY_ACTION.THROW) {
      throw new Error(
        `[EntityDecoder] Registration of ${context} entity "&${name};" was rejected by hook`
      );
    }
    return true;
  }
  // -------------------------------------------------------------------------
  // Persistent external entity registration
  // -------------------------------------------------------------------------
  /**
   * Replace the full set of persistent external entities.
   * All keys are validated — throws on invalid characters.
   * If `onExternalEntity` is set, it is called once per entry; entries that
   * return `ENTITY_ACTION.BLOCK` are silently omitted, `ENTITY_ACTION.THROW`
   * aborts the whole call.
   * @param {Record<string, string | { regex?: RegExp, val: string }>} map
   */
  setExternalEntities(map) {
    if (map) {
      for (const key of Object.keys(map)) {
        validateEntityName(key);
      }
    }
    if (!this._onExternalEntity) {
      this._externalMap = mergeEntityMaps(map);
      return;
    }
    const flat = mergeEntityMaps(map);
    const filtered = /* @__PURE__ */ Object.create(null);
    for (const [name, value] of Object.entries(flat)) {
      if (this._applyRegistrationHook(this._onExternalEntity, name, value, "external")) {
        filtered[name] = value;
      }
    }
    this._externalMap = filtered;
  }
  /**
   * Add a single persistent external entity.
   * If `onExternalEntity` is set it is called before the entity is stored;
   * `ENTITY_ACTION.BLOCK` silently skips storage, `ENTITY_ACTION.THROW` raises.
   * @param {string} key
   * @param {string} value
   */
  addExternalEntity(key, value) {
    validateEntityName(key);
    if (typeof value === "string" && value.indexOf("&") === -1) {
      if (this._applyRegistrationHook(this._onExternalEntity, key, value, "external")) {
        this._externalMap[key] = value;
      }
    }
  }
  // -------------------------------------------------------------------------
  // Input / runtime entity registration (per document)
  // -------------------------------------------------------------------------
  /**
   * Inject DOCTYPE entities for the current document.
   * Also resets per-document expansion counters.
   * If `onInputEntity` is set it is called once per entry; entries returning
   * `ENTITY_ACTION.BLOCK` are silently omitted, `ENTITY_ACTION.THROW` aborts.
   * @param {Record<string, string | { regx?: RegExp, regex?: RegExp, val: string }>} map
   */
  addInputEntities(map) {
    this._totalExpansions = 0;
    this._expandedLength = 0;
    if (!this._onInputEntity) {
      this._inputMap = mergeEntityMaps(map);
      return;
    }
    const flat = mergeEntityMaps(map);
    const filtered = /* @__PURE__ */ Object.create(null);
    for (const [name, value] of Object.entries(flat)) {
      if (this._applyRegistrationHook(this._onInputEntity, name, value, "input")) {
        filtered[name] = value;
      }
    }
    this._inputMap = filtered;
  }
  // -------------------------------------------------------------------------
  // Per-document reset
  // -------------------------------------------------------------------------
  /**
   * Wipe input/runtime entities and reset counters.
   * Call this before processing each new document.
   * @returns {this}
   */
  reset() {
    this._inputMap = /* @__PURE__ */ Object.create(null);
    this._totalExpansions = 0;
    this._expandedLength = 0;
    return this;
  }
  // -------------------------------------------------------------------------
  // XML version (can be set after construction, e.g. once parser reads <?xml?>)
  // -------------------------------------------------------------------------
  /**
   * Update the XML version used for NCR classification.
   * Call this as soon as the document's `<?xml version="...">` declaration is parsed.
   * @param {1.0|1.1|number} version
   */
  setXmlVersion(version) {
    this._ncrXmlVersion = version === 1.1 ? 1.1 : 1;
  }
  // -------------------------------------------------------------------------
  // Primary API
  // -------------------------------------------------------------------------
  /**
   * Replace all entity references in `str` in a single pass.
   *
   * @param {string} str
   * @returns {string}
   */
  decode(str) {
    if (typeof str !== "string" || str.length === 0) return str;
    if (str.indexOf("&") === -1) return str;
    const original = str;
    const chunks = [];
    const len = str.length;
    let last = 0;
    let i = 0;
    const limitExpansions = this._maxTotalExpansions > 0;
    const limitLength = this._maxExpandedLength > 0;
    const checkLimits = limitExpansions || limitLength;
    while (i < len) {
      if (str.charCodeAt(i) !== 38) {
        i++;
        continue;
      }
      let j = i + 1;
      while (j < len && str.charCodeAt(j) !== 59 && j - i <= 32) j++;
      if (j >= len || str.charCodeAt(j) !== 59) {
        i++;
        continue;
      }
      const token = str.slice(i + 1, j);
      if (token.length === 0) {
        i++;
        continue;
      }
      let replacement;
      let tier;
      if (this._removeSet.has(token)) {
        replacement = "";
        if (tier === void 0) {
          tier = LIMIT_TIER_EXTERNAL;
        }
      } else if (this._leaveSet.has(token)) {
        i++;
        continue;
      } else if (token.charCodeAt(0) === 35) {
        const ncrResult = this._resolveNCR(token);
        if (ncrResult === void 0) {
          i++;
          continue;
        }
        replacement = ncrResult;
        tier = LIMIT_TIER_BASE;
      } else {
        const resolved = this._resolveName(token);
        replacement = resolved?.value;
        tier = resolved?.tier;
      }
      if (replacement === void 0) {
        i++;
        continue;
      }
      if (i > last) chunks.push(str.slice(last, i));
      chunks.push(replacement);
      last = j + 1;
      i = last;
      if (checkLimits && this._tierCounts(tier)) {
        if (limitExpansions) {
          this._totalExpansions++;
          if (this._totalExpansions > this._maxTotalExpansions) {
            throw new Error(
              `[EntityReplacer] Entity expansion count limit exceeded: ${this._totalExpansions} > ${this._maxTotalExpansions}`
            );
          }
        }
        if (limitLength) {
          const delta = replacement.length - (token.length + 2);
          if (delta > 0) {
            this._expandedLength += delta;
            if (this._expandedLength > this._maxExpandedLength) {
              throw new Error(
                `[EntityReplacer] Expanded content length limit exceeded: ${this._expandedLength} > ${this._maxExpandedLength}`
              );
            }
          }
        }
      }
    }
    if (last < len) chunks.push(str.slice(last));
    const result = chunks.length === 0 ? str : chunks.join("");
    return this._postCheck(result, original);
  }
  // -------------------------------------------------------------------------
  // Private: limit tier check
  // -------------------------------------------------------------------------
  /**
   * Returns true if a resolved entity of the given tier should count
   * against the expansion/length limits.
   * @param {string} tier  — LIMIT_TIER_EXTERNAL | LIMIT_TIER_BASE
   * @returns {boolean}
   */
  _tierCounts(tier) {
    if (this._limitTiers.has(LIMIT_TIER_ALL)) return true;
    return this._limitTiers.has(tier);
  }
  // -------------------------------------------------------------------------
  // Private: entity resolution
  // -------------------------------------------------------------------------
  /**
   * Resolve a named entity token (without & and ;).
   * Priority: inputMap > externalMap > baseMap
   * Returns the resolved value tagged with its limit tier.
   *
   * @param {string} name
   * @returns {{ value: string, tier: string }|undefined}
   */
  _resolveName(name) {
    if (name in this._inputMap) return { value: this._inputMap[name], tier: LIMIT_TIER_EXTERNAL };
    if (name in this._externalMap) return { value: this._externalMap[name], tier: LIMIT_TIER_EXTERNAL };
    if (name in this._baseMap) return { value: this._baseMap[name], tier: LIMIT_TIER_BASE };
    return void 0;
  }
  /**
   * Classify a codepoint and return the minimum action level that must be applied.
   * Returns -1 when no minimum is imposed (normal allow path).
   *
   * Ranges checked (in priority order):
   *   1. U+0000            — null, governed by nullNCR (always ≥ remove)
   *   2. U+D800–U+DFFF     — surrogates, always prohibited (min: remove)
   *   3. U+0001–U+001F \ {0x09,0x0A,0x0D}  — XML 1.0 restricted C0 (min: remove)
   *      (skipped in XML 1.1 — C0 controls are allowed when written as NCRs)
   *
   * @param {number} cp  — codepoint
   * @returns {number}   — minimum NCR_LEVEL value, or -1 for no restriction
   */
  _classifyNCR(cp) {
    if (cp === 0) return this._ncrNullLevel;
    if (cp >= 55296 && cp <= 57343) return NCR_LEVEL.remove;
    if (this._ncrXmlVersion === 1) {
      if (cp >= 1 && cp <= 31 && !XML10_ALLOWED_C0.has(cp)) return NCR_LEVEL.remove;
    }
    return -1;
  }
  /**
   * Execute a resolved NCR action.
   *
   * @param {number} action   — NCR_LEVEL value
   * @param {string} token    — raw token (e.g. '#38') for error messages
   * @param {number} cp       — codepoint, used only for error messages
   * @returns {string|undefined}
   *   - decoded character string  → 'allow'
   *   - ''                        → 'remove'
   *   - undefined                 → 'leave' (caller must skip past '&' only)
   *   - throws Error              → 'throw'
   */
  _applyNCRAction(action, token, cp) {
    switch (action) {
      case NCR_LEVEL.allow:
        return String.fromCodePoint(cp);
      case NCR_LEVEL.remove:
        return "";
      case NCR_LEVEL.leave:
        return void 0;
      // signal: keep literal
      case NCR_LEVEL.throw:
        throw new Error(
          `[EntityDecoder] Prohibited numeric character reference &${token}; (U+${cp.toString(16).toUpperCase().padStart(4, "0")})`
        );
      default:
        return String.fromCodePoint(cp);
    }
  }
  /**
   * Full NCR resolution pipeline for a numeric token.
   *
   * Steps:
   *   1. Parse the codepoint (decimal or hex).
   *   2. Validate the raw codepoint range (NaN, <0, >0x10FFFF).
   *   3. If numericAllowed is false and no minimum restriction applies → leave as-is.
   *   4. Classify the codepoint to find the minimum required action level.
   *   5. Resolve effective action = max(onNCR, minimum).
   *   6. Apply and return.
   *
   * @param {string} token  — e.g. '#38', '#x26', '#X26'
   * @returns {string|undefined}
   *   - string (incl. '')  — replacement ('' = remove)
   *   - undefined          — leave original &token; as-is
   */
  _resolveNCR(token) {
    const second = token.charCodeAt(1);
    let cp;
    if (second === 120 || second === 88) {
      cp = parseInt(token.slice(2), 16);
    } else {
      cp = parseInt(token.slice(1), 10);
    }
    if (Number.isNaN(cp) || cp < 0 || cp > 1114111) return void 0;
    const minimum = this._classifyNCR(cp);
    if (!this._numericAllowed && minimum < NCR_LEVEL.remove) return void 0;
    const effective = minimum === -1 ? this._ncrOnLevel : Math.max(this._ncrOnLevel, minimum);
    return this._applyNCRAction(effective, token, cp);
  }
};

// node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var defaultOnDangerousProperty = (name) => {
  if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return "__" + name;
  }
  return name;
};
var defaultOptions2 = {
  preserveOrder: false,
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  removeNSPrefix: false,
  // remove NS from tag name or attribute name if true
  allowBooleanAttributes: false,
  //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: true,
  parseAttributeValue: false,
  trimValues: true,
  //Trim string values of tag and attributes
  cdataPropName: false,
  numberParseOptions: {
    hex: true,
    leadingZeros: true,
    eNotation: true,
    unicode: false
  },
  tagValueProcessor: function(tagName, val) {
    return val;
  },
  attributeValueProcessor: function(attrName, val) {
    return val;
  },
  stopNodes: [],
  //nested tags will not be parsed even for errors
  alwaysCreateTextNode: false,
  isArray: () => false,
  commentPropName: false,
  unpairedTags: [],
  processEntities: true,
  htmlEntities: false,
  entityDecoder: null,
  ignoreDeclaration: false,
  ignorePiTags: false,
  transformTagName: false,
  transformAttributeName: false,
  updateTag: function(tagName, jPath, attrs) {
    return tagName;
  },
  // skipEmptyListItem: false
  captureMetaData: false,
  maxNestedTags: 100,
  strictReservedNames: true,
  jPath: true,
  // if true, pass jPath string to callbacks; if false, pass matcher instance
  onDangerousProperty: defaultOnDangerousProperty
};
function validatePropertyName(propertyName, optionName) {
  if (typeof propertyName !== "string") {
    return;
  }
  const normalized = propertyName.toLowerCase();
  if (DANGEROUS_PROPERTY_NAMES.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
  if (criticalProperties.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
}
function normalizeProcessEntities(value, htmlEntities) {
  if (typeof value === "boolean") {
    return {
      enabled: value,
      // true or false
      maxEntitySize: 1e4,
      maxExpansionDepth: 1e4,
      maxTotalExpansions: Infinity,
      maxExpandedLength: 1e5,
      maxEntityCount: 1e3,
      allowedTags: null,
      tagFilter: null,
      appliesTo: "all"
    };
  }
  if (typeof value === "object" && value !== null) {
    return {
      enabled: value.enabled !== false,
      maxEntitySize: Math.max(1, value.maxEntitySize ?? 1e4),
      maxExpansionDepth: Math.max(1, value.maxExpansionDepth ?? 1e4),
      maxTotalExpansions: Math.max(1, value.maxTotalExpansions ?? Infinity),
      maxExpandedLength: Math.max(1, value.maxExpandedLength ?? 1e5),
      maxEntityCount: Math.max(1, value.maxEntityCount ?? 1e3),
      allowedTags: value.allowedTags ?? null,
      tagFilter: value.tagFilter ?? null,
      appliesTo: value.appliesTo ?? "all"
    };
  }
  return normalizeProcessEntities(true);
}
var buildOptions = function(options) {
  const built = Object.assign({}, defaultOptions2, options);
  const propertyNameOptions = [
    { value: built.attributeNamePrefix, name: "attributeNamePrefix" },
    { value: built.attributesGroupName, name: "attributesGroupName" },
    { value: built.textNodeName, name: "textNodeName" },
    { value: built.cdataPropName, name: "cdataPropName" },
    { value: built.commentPropName, name: "commentPropName" }
  ];
  for (const { value, name } of propertyNameOptions) {
    if (value) {
      validatePropertyName(value, name);
    }
  }
  if (built.onDangerousProperty === null) {
    built.onDangerousProperty = defaultOnDangerousProperty;
  }
  built.processEntities = normalizeProcessEntities(built.processEntities, built.htmlEntities);
  built.unpairedTagsSet = new Set(built.unpairedTags);
  if (built.stopNodes && Array.isArray(built.stopNodes)) {
    built.stopNodes = built.stopNodes.map((node) => {
      if (typeof node === "string" && node.startsWith("*.")) {
        return ".." + node.substring(2);
      }
      return node;
    });
  }
  return built;
};

// node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var METADATA_SYMBOL;
if (typeof Symbol !== "function") {
  METADATA_SYMBOL = "@@xmlMetadata";
} else {
  METADATA_SYMBOL = Symbol("XML Node Metadata");
}
var XmlNode = class {
  constructor(tagname) {
    this.tagname = tagname;
    this.child = [];
    this[":@"] = /* @__PURE__ */ Object.create(null);
  }
  add(key, val) {
    if (key === "__proto__") key = "#__proto__";
    this.child.push({ [key]: val });
  }
  addChild(node, startIndex) {
    if (node.tagname === "__proto__") node.tagname = "#__proto__";
    if (node[":@"] && Object.keys(node[":@"]).length > 0) {
      this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
    } else {
      this.child.push({ [node.tagname]: node.child });
    }
    this.addStartIndex(startIndex);
  }
  addStartIndex(startIndex) {
    if (startIndex !== void 0) {
      this.child[this.child.length - 1][METADATA_SYMBOL] = { startIndex };
    }
  }
  addEndIndex(endIndex) {
    const lastChild = this.child[this.child.length - 1];
    if (lastChild !== void 0 && lastChild[METADATA_SYMBOL] !== void 0 && lastChild[METADATA_SYMBOL].endIndex === void 0) {
      lastChild[METADATA_SYMBOL].endIndex = endIndex;
    }
  }
  /** symbol used for metadata */
  static getMetaDataSymbol() {
    return METADATA_SYMBOL;
  }
};

// node_modules/xml-naming/src/index.js
var nameStartChar10 = ":A-Za-z_\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u0486\u0488-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD";
var nameChar10 = nameStartChar10 + "\\-\\.\\d\xB7\u0300-\u036F\u203F-\u2040";
var nameStartChar11 = ":A-Za-z_\xC0-\u02FF\u0370-\u037D\u037F-\u0486\u0488-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}";
var nameChar11 = nameStartChar11 + "\\-\\.\\d\xB7\u0300-\u036F\u0487\u203F-\u2040";
var buildRegexes = (startChar, char, flags = "") => {
  const ncStart = startChar.replace(":", "");
  const ncChar = char.replace(":", "");
  const ncNamePat = `[${ncStart}][${ncChar}]*`;
  return {
    name: new RegExp(`^[${startChar}][${char}]*$`, flags),
    ncName: new RegExp(`^${ncNamePat}$`, flags),
    qName: new RegExp(`^${ncNamePat}(?::${ncNamePat})?$`, flags),
    nmToken: new RegExp(`^[${char}]+$`, flags),
    nmTokens: new RegExp(`^[${char}]+(?:\\s+[${char}]+)*$`, flags)
  };
};
var regexes10 = buildRegexes(nameStartChar10, nameChar10);
var regexes11 = buildRegexes(nameStartChar11, nameChar11, "u");
var nameStartCharAscii = ":A-Za-z_";
var nameCharAscii = nameStartCharAscii + "\\-\\.\\d";
var regexesAscii = buildRegexes(nameStartCharAscii, nameCharAscii);
var getRegexes = (xmlVersion = "1.0", asciiOnly = false) => {
  if (asciiOnly) return regexesAscii;
  return xmlVersion === "1.1" ? regexes11 : regexes10;
};
var qName = (str, { xmlVersion = "1.0", asciiOnly = false } = {}) => getRegexes(xmlVersion, asciiOnly).qName.test(str);

// node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var DocTypeReader = class {
  constructor(options, xmlVersion) {
    this.suppressValidationErr = !options;
    this.options = options;
    this.xmlVersion = xmlVersion || 1;
  }
  setXmlVersion(xmlVersion = 1) {
    this.xmlVersion = xmlVersion;
  }
  readDocType(xmlData, i) {
    const entities = /* @__PURE__ */ Object.create(null);
    let entityCount = 0;
    if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
      i = i + 9;
      let angleBracketsCount = 1;
      let hasBody = false, comment = false;
      let quoteChar = null;
      let exp = "";
      for (; i < xmlData.length; i++) {
        if (quoteChar !== null) {
          if (xmlData[i] === quoteChar) quoteChar = null;
          exp += xmlData[i];
          continue;
        }
        if (!hasBody && !comment && (xmlData[i] === '"' || xmlData[i] === "'")) {
          quoteChar = xmlData[i];
          exp += xmlData[i];
          continue;
        }
        if (xmlData[i] === "<" && !comment) {
          if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
            i += 7;
            let entityName, val;
            [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
            if (val.indexOf("&") === -1) {
              if (this.options.enabled !== false && this.options.maxEntityCount != null && entityCount >= this.options.maxEntityCount) {
                throw new Error(
                  `Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`
                );
              }
              entities[entityName] = val;
              entityCount++;
            }
          } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
            i += 8;
            const { index } = this.readElementExp(xmlData, i + 1);
            i = index;
          } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
            i += 8;
          } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
            i += 9;
            const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
            i = index;
          } else if (hasSeq(xmlData, "!--", i)) comment = true;
          else throw new Error(`Invalid DOCTYPE`);
          angleBracketsCount++;
          exp = "";
        } else if (xmlData[i] === ">") {
          if (comment) {
            if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
              comment = false;
              angleBracketsCount--;
            }
          } else {
            angleBracketsCount--;
          }
          if (angleBracketsCount === 0) {
            break;
          }
        } else if (xmlData[i] === "[") {
          hasBody = true;
        } else {
          exp += xmlData[i];
        }
      }
      if (quoteChar !== null || angleBracketsCount !== 0) {
        throw new Error(`Unclosed DOCTYPE`);
      }
    } else {
      throw new Error(`Invalid Tag instead of DOCTYPE`);
    }
    return { entities, i };
  }
  readEntityExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
      i++;
    }
    let entityName = xmlData.substring(startIndex, i);
    validateEntityName2(entityName, { xmlVersion: this.xmlVersion });
    i = skipWhitespace(xmlData, i);
    if (!this.suppressValidationErr) {
      if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
        throw new Error("External entities are not supported");
      } else if (xmlData[i] === "%") {
        throw new Error("Parameter entities are not supported");
      }
    }
    let entityValue = "";
    [i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");
    if (this.options.enabled !== false && this.options.maxEntitySize != null && entityValue.length > this.options.maxEntitySize) {
      throw new Error(
        `Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`
      );
    }
    i--;
    return [entityName, entityValue, i];
  }
  readNotationExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let notationName = xmlData.substring(startIndex, i);
    !this.suppressValidationErr && validateEntityName2(notationName, { xmlVersion: this.xmlVersion });
    i = skipWhitespace(xmlData, i);
    const identifierType = xmlData.substring(i, i + 6).toUpperCase();
    if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
      throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
    }
    i += identifierType.length;
    i = skipWhitespace(xmlData, i);
    let publicIdentifier = null;
    let systemIdentifier = null;
    if (identifierType === "PUBLIC") {
      [i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] === '"' || xmlData[i] === "'") {
        [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      }
    } else if (identifierType === "SYSTEM") {
      [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      if (!this.suppressValidationErr && !systemIdentifier) {
        throw new Error("Missing mandatory system identifier for SYSTEM notation");
      }
    }
    return { notationName, publicIdentifier, systemIdentifier, index: --i };
  }
  readIdentifierVal(xmlData, i, type) {
    let identifierVal = "";
    const startChar = xmlData[i];
    if (startChar !== '"' && startChar !== "'") {
      throw new Error(`Expected quoted string, found "${startChar}"`);
    }
    i++;
    const startIndex = i;
    while (i < xmlData.length && xmlData[i] !== startChar) {
      i++;
    }
    identifierVal = xmlData.substring(startIndex, i);
    if (xmlData[i] !== startChar) {
      throw new Error(`Unterminated ${type} value`);
    }
    i++;
    return [i, identifierVal];
  }
  readElementExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    if (!this.suppressValidationErr && !qName(elementName, { xmlVersion: this.xmlVersion })) {
      throw new Error(`Invalid element name: "${elementName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let contentModel = "";
    if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i)) i += 4;
    else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i)) i += 2;
    else if (xmlData[i] === "(") {
      i++;
      const startIndex2 = i;
      while (i < xmlData.length && xmlData[i] !== ")") {
        i++;
      }
      contentModel = xmlData.substring(startIndex2, i);
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated content model");
      }
    } else if (!this.suppressValidationErr) {
      throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
    }
    return {
      elementName,
      contentModel: contentModel.trim(),
      index: i
    };
  }
  readAttlistExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    validateEntityName2(elementName, { xmlVersion: this.xmlVersion });
    i = skipWhitespace(xmlData, i);
    startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let attributeName = xmlData.substring(startIndex, i);
    if (!validateEntityName2(attributeName, { xmlVersion: this.xmlVersion })) {
      throw new Error(`Invalid attribute name: "${attributeName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let attributeType = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
      attributeType = "NOTATION";
      i += 8;
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] !== "(") {
        throw new Error(`Expected '(', found "${xmlData[i]}"`);
      }
      i++;
      let allowedNotations = [];
      while (i < xmlData.length && xmlData[i] !== ")") {
        const startIndex2 = i;
        while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {
          i++;
        }
        let notation = xmlData.substring(startIndex2, i);
        notation = notation.trim();
        if (!validateEntityName2(notation, { xmlVersion: this.xmlVersion })) {
          throw new Error(`Invalid notation name: "${notation}"`);
        }
        allowedNotations.push(notation);
        if (xmlData[i] === "|") {
          i++;
          i = skipWhitespace(xmlData, i);
        }
      }
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated list of notations");
      }
      i++;
      attributeType += " (" + allowedNotations.join("|") + ")";
    } else {
      const startIndex2 = i;
      while (i < xmlData.length && !/\s/.test(xmlData[i])) {
        i++;
      }
      attributeType += xmlData.substring(startIndex2, i);
      const validTypes = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
      if (!this.suppressValidationErr && !validTypes.includes(attributeType.toUpperCase())) {
        throw new Error(`Invalid attribute type: "${attributeType}"`);
      }
    }
    i = skipWhitespace(xmlData, i);
    let defaultValue = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
      defaultValue = "#REQUIRED";
      i += 8;
    } else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
      defaultValue = "#IMPLIED";
      i += 7;
    } else {
      [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
    }
    return {
      elementName,
      attributeName,
      attributeType,
      defaultValue,
      index: i
    };
  }
};
var skipWhitespace = (data, index) => {
  while (index < data.length && /\s/.test(data[index])) {
    index++;
  }
  return index;
};
function hasSeq(data, seq, i) {
  for (let j = 0; j < seq.length; j++) {
    if (seq[j] !== data[i + j + 1]) return false;
  }
  return true;
}
function validateEntityName2(name, xmlVersion) {
  if (qName(name, { xmlVersion }))
    return name;
  else
    throw new Error(`Invalid entity name ${name}`);
}

// node_modules/anynum/digitTable.js
var SCRIPT_ZEROS = [
  // Basic Latin (ASCII) — included for completeness / pass-through
  48,
  // 0-9
  // Arabic scripts
  1632,
  // Arabic-Indic ٠١٢٣٤٥٦٧٨٩
  1776,
  // Extended Arabic-Indic (Urdu/Persian/Sindhi) ۰۱۲۳
  // Indic scripts
  2406,
  // Devanagari ०१२३४५६७८९
  2534,
  // Bengali ০১২৩৪৫৬৭৮৯
  2662,
  // Gurmukhi ੦੧੨੩੪੫੬੭੮੯
  2790,
  // Gujarati ૦૧૨૩૪૫૬૭૮૯
  2918,
  // Odia ୦୧୨୩୪୫୬୭୮୯
  3046,
  // Tamil ௦௧௨௩௪௫௬௭௮௯
  3174,
  // Telugu ౦౧౨౩౪౫౬౭౮౯
  3302,
  // Kannada ೦೧೨೩೪೫೬೭೮೯
  3430,
  // Malayalam ൦൧൨൩൪൫൬൭൮൯
  3558,
  // Sinhala Archaic ෦෧෨෩෪෫෬෭෮෯
  // Southeast Asian scripts
  3664,
  // Thai ๐๑๒๓๔๕๖๗๘๙
  3792,
  // Lao ໐໑໒໓໔໕໖໗໘໙
  3872,
  // Tibetan ༠༡༢༣༤༥༦༧༨༩
  4160,
  // Myanmar ၀၁၂၃၄၅၆၇၈၉
  4240,
  // Myanmar Shan ႐႑႒႓႔႕႖႗႘႙
  6112,
  // Khmer ០១២៣៤៥៦៧៨៩
  6160,
  // Mongolian ᠐᠑᠒᠓᠔᠕᠖᠗᠘᠙
  6470,
  // Limbu ᥆᥇᥈᥉᥊᥋᥌᥍᥎᥏
  6608,
  // New Tai Lue ᧐᧑᧒᧓᧔᧕᧖᧗᧘᧙
  6784,
  // Tai Tham Hora ᪀᪁᪂᪃᪄᪅᪆᪇᪈᪉
  6800,
  // Tai Tham Tham ᪐᪑᪒᪓᪔᪕᪖᪗᪘᪙
  6992,
  // Balinese ᭐᭑᭒᭓᭔᭕᭖᭗᭘᭙
  7088,
  // Sundanese ᮰᮱᮲᮳᮴᮵᮶᮷᮸᮹
  7232,
  // Lepcha ᱀᱁᱂᱃᱄᱅᱆᱇᱈᱉
  7248,
  // Ol Chiki ᱐᱑᱒᱓᱔᱕᱖᱗᱘᱙
  // Fullwidth (CJK context)
  65296,
  // Fullwidth ０１２３４５６７８９
  // Mathematical digit variants (Unicode math block)
  120782,
  // Mathematical Bold
  120792,
  // Mathematical Double-Struck
  120802,
  // Mathematical Sans-Serif
  120812,
  // Mathematical Sans-Serif Bold
  120822,
  // Mathematical Monospace
  // Other scripts
  66720,
  // Osmanya 𐒠𐒡𐒢𐒣𐒤𐒥𐒦𐒧𐒨𐒩
  68912,
  // Hanifi Rohingya 𐴰𐴱𐴲𐴳𐴴𐴵𐴶𐴷𐴸𐴹
  69734,
  // Brahmi 𑁦𑁧𑁨𑁩𑁪𑁫𑁬𑁭𑁮𑁯
  69872,
  // Sora Sompeng 𑃰𑃱𑃲𑃳𑃴𑃵𑃶𑃷𑃸𑃹
  69942,
  // Chakma 𑄶𑄷𑄸𑄹𑄺𑄻𑄼𑄽𑄾𑄿
  70096,
  // Sharada 𑇐𑇑𑇒𑇓𑇔𑇕𑇖𑇗𑇘𑇙
  70384,
  // Khudawadi 𑋰𑋱𑋲𑋳𑋴𑋵𑋶𑋷𑋸𑋹
  70736,
  // Newa 𑑐𑑑𑑒𑑓𑑔𑑕𑑖𑑗𑑘𑑙
  70864,
  // Tirhuta 𑓐𑓑𑓒𑓓𑓔𑓕𑓖𑓗𑓘𑓙
  71248,
  // Modi 𑙐𑙑𑙒𑙓𑙔𑙕𑙖𑙗𑙘𑙙
  71360,
  // Takri 𑛀𑛁𑛂𑛃𑛄𑛅𑛆𑛇𑛈𑛉
  71472,
  // Ahom 𑜰𑜱𑜲𑜳𑜴𑜵𑜶𑜷𑜸𑜹
  71904,
  // Warang Citi 𑣠𑣡𑣢𑣣𑣤𑣥𑣦𑣧𑣨𑣩
  72016,
  // Dives Akuru 𑥐𑥑𑥒𑥓𑥔𑥕𑥖𑥗𑥘𑥙
  72688,
  // Khitan Small Script 𑯰𑯱𑯲𑯳𑯴𑯵𑯶𑯷𑯸𑯹
  72784,
  // Bhaiksuki 𑱐𑱑𑱒𑱓𑱔𑱕𑱖𑱗𑱘𑱙
  73040,
  // Masaram Gondi 𑵐𑵑𑵒𑵓𑵔𑵕𑵖𑵗𑵘𑵙
  73120,
  // Gunjala Gondi 𑶠𑶡𑶢𑶣𑶤𑶥𑶦𑶧𑶨𑶩
  73552,
  // Kawi 𑽐𑽑𑽒𑽓𑽔𑽕𑽖𑽗𑽘𑽙
  92768,
  // Mro 𖩠𖩡𖩢𖩣𖩤𖩥𖩦𖩧𖩨𖩩
  92864,
  // Tangsa 𖫀𖫁𖫂𖫃𖫄𖫅𖫆𖫇𖫈𖫉
  93008,
  // Pahawh Hmong 𖭐𖭑𖭒𖭓𖭔𖭕𖭖𖭗𖭘𖭙
  123200,
  // Nyiakeng Puachue Hmong 𞅀𞅁𞅂𞅃𞅄𞅅𞅆𞅇𞅈𞅉
  123632,
  // Wancho 𞋰𞋱𞋲𞋳𞋴𞋵𞋶𞋷𞋸𞋹
  124144,
  // Nag Mundari 𞓰𞓱𞓲𞓳𞓴𞓵𞓶𞓷𞓸𞓹
  125264,
  // Adlam 𞥐𞥑𞥒𞥓𞥔𞥕𞥖𞥗𞥘𞥙
  130032
  // Segmented digit symbols 🯰🯱🯲🯳🯴🯵🯶🯷🯸🯹
];
var NOT_DIGIT = 255;
var HIGH_MAP = /* @__PURE__ */ new Map();
var LOW_MAX = 65535;
var LOW_MIN = 1632;
var TABLE_OFFSET = LOW_MIN;
var TABLE_SIZE = LOW_MAX - LOW_MIN + 1;
var TABLE = new Uint8Array(TABLE_SIZE).fill(NOT_DIGIT);
for (const zero of SCRIPT_ZEROS) {
  for (let d = 0; d < 10; d++) {
    const cp = zero + d;
    if (cp <= LOW_MAX) {
      TABLE[cp - TABLE_OFFSET] = d;
    } else {
      HIGH_MAP.set(cp, d);
    }
  }
}

// node_modules/anynum/anynum.js
var CHAR_0 = 48;
var CHAR_9 = 57;
var CHAR_MINUS = 45;
var MINUS_SET = /* @__PURE__ */ new Set([8722, 65293, 65123]);
function anynum(str) {
  if (typeof str !== "string") return str;
  const len = str.length;
  if (len === 0) return str;
  let firstHit = -1;
  for (let i = 0; i < len; i++) {
    const cc = str.charCodeAt(i);
    if (cc >= CHAR_0 && cc <= CHAR_9 || cc === CHAR_MINUS) continue;
    if (cc < TABLE_OFFSET) {
      if (MINUS_SET.has(cc)) {
        firstHit = i;
        break;
      }
      continue;
    }
    if (cc >= 55296 && cc <= 56319) {
      if (i + 1 < len) {
        const low = str.charCodeAt(i + 1);
        if (low >= 56320 && low <= 57343) {
          const cp = 65536 + (cc - 55296 << 10) + (low - 56320);
          if (HIGH_MAP.has(cp)) {
            firstHit = i;
            break;
          }
        }
      }
      continue;
    }
    if (TABLE[cc - TABLE_OFFSET] !== NOT_DIGIT || MINUS_SET.has(cc)) {
      firstHit = i;
      break;
    }
  }
  if (firstHit === -1) return str;
  const chars = [];
  if (firstHit > 0) chars.push(str.slice(0, firstHit));
  for (let i = firstHit; i < len; i++) {
    const cc = str.charCodeAt(i);
    if (cc >= CHAR_0 && cc <= CHAR_9 || cc === CHAR_MINUS) {
      chars.push(str[i]);
      continue;
    }
    if (cc < TABLE_OFFSET) {
      chars.push(MINUS_SET.has(cc) ? "-" : str[i]);
      continue;
    }
    if (cc >= 55296 && cc <= 56319) {
      if (i + 1 < len) {
        const low = str.charCodeAt(i + 1);
        if (low >= 56320 && low <= 57343) {
          const cp = 65536 + (cc - 55296 << 10) + (low - 56320);
          const d2 = HIGH_MAP.get(cp);
          if (d2 !== void 0) {
            chars.push(String.fromCharCode(d2 + 48));
            i++;
            continue;
          }
        }
      }
      chars.push(str[i]);
      continue;
    }
    if (MINUS_SET.has(cc)) {
      chars.push("-");
      continue;
    }
    const d = TABLE[cc - TABLE_OFFSET];
    chars.push(d !== NOT_DIGIT ? String.fromCharCode(d + 48) : str[i]);
  }
  return chars.join("");
}
var anynum_default = anynum;

// node_modules/strnum/strnum.js
var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
var binRegex = /^0b[01]+$/;
var octRegex = /^0o[0-7]+$/;
var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
var consider = {
  hex: true,
  binary: false,
  octal: false,
  leadingZeros: true,
  decimalPoint: ".",
  eNotation: true,
  //skipLike: /regex/,
  infinity: "original",
  // "null", "infinity" (Infinity type), "string" ("Infinity" (the string literal))
  unicode: false
};
function toNumber(str, options = {}) {
  options = Object.assign({}, consider, options);
  if (!str || typeof str !== "string") return str;
  let trimmedStr = str.trim();
  if (trimmedStr.length === 0) return str;
  else if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr)) return str;
  else if (trimmedStr === "0") return 0;
  if (options.unicode) {
    trimmedStr = anynum_default(trimmedStr);
    if (trimmedStr === "0") return 0;
  }
  if (options.hex && hexRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 16);
  } else if (options.binary && binRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 2);
  } else if (options.octal && octRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 8);
  } else if (!isFinite(trimmedStr)) {
    return handleInfinity(str, Number(trimmedStr), options);
  } else if (trimmedStr.includes("e") || trimmedStr.includes("E")) {
    return resolveEnotation(str, trimmedStr, options);
  } else {
    const match = numRegex.exec(trimmedStr);
    if (match) {
      const sign = match[1] || "";
      const leadingZeros = match[2];
      let numTrimmedByZeros = trimZeros(match[3]);
      const decimalAdjacentToLeadingZeros = sign ? (
        // 0., -00., 000.
        str[leadingZeros.length + 1] === "."
      ) : str[leadingZeros.length] === ".";
      if (!options.leadingZeros && (leadingZeros.length > 1 || leadingZeros.length === 1 && !decimalAdjacentToLeadingZeros)) {
        return str;
      } else {
        const num = Number(trimmedStr);
        const parsedStr = String(num);
        if (num === 0) return num;
        if (parsedStr.search(/[eE]/) !== -1) {
          if (options.eNotation) return num;
          else return str;
        } else if (trimmedStr.indexOf(".") !== -1) {
          if (parsedStr === "0") return num;
          else if (parsedStr === numTrimmedByZeros) return num;
          else if (parsedStr === `${sign}${numTrimmedByZeros}`) return num;
          else return str;
        }
        let n = leadingZeros ? numTrimmedByZeros : trimmedStr;
        if (leadingZeros) {
          return n === parsedStr || sign + n === parsedStr ? num : str;
        } else {
          return n === parsedStr || n === sign + parsedStr ? num : str;
        }
      }
    } else {
      return str;
    }
  }
}
var eNotationRegx = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function resolveEnotation(str, trimmedStr, options) {
  if (!options.eNotation) return str;
  const notation = trimmedStr.match(eNotationRegx);
  if (notation) {
    let sign = notation[1] || "";
    const eChar = notation[3].indexOf("e") === -1 ? "E" : "e";
    const leadingZeros = notation[2];
    const eAdjacentToLeadingZeros = sign ? (
      // 0E.
      str[leadingZeros.length + 1] === eChar
    ) : str[leadingZeros.length] === eChar;
    if (leadingZeros.length > 1 && eAdjacentToLeadingZeros) return str;
    else if (leadingZeros.length === 1 && (notation[3].startsWith(`.${eChar}`) || notation[3][0] === eChar)) {
      return Number(trimmedStr);
    } else if (leadingZeros.length > 0) {
      if (options.leadingZeros && !eAdjacentToLeadingZeros) {
        trimmedStr = (notation[1] || "") + notation[3];
        return Number(trimmedStr);
      } else return str;
    } else {
      return Number(trimmedStr);
    }
  } else {
    return str;
  }
}
function trimZeros(numStr) {
  if (numStr && numStr.indexOf(".") !== -1) {
    let end = numStr.length;
    while (end > 0 && numStr.charCodeAt(end - 1) === 48) end--;
    numStr = numStr.slice(0, end);
    if (numStr === ".") numStr = "0";
    else if (numStr[0] === ".") numStr = "0" + numStr;
    else if (numStr[numStr.length - 1] === ".") numStr = numStr.substring(0, numStr.length - 1);
    return numStr;
  }
  return numStr;
}
function parse_int(numStr, base) {
  const str = numStr.trim();
  if (base === 2 || base === 8) numStr = str.substring(2);
  if (parseInt) return parseInt(numStr, base);
  else if (Number.parseInt) return Number.parseInt(numStr, base);
  else if (window && window.parseInt) return window.parseInt(numStr, base);
  else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
function handleInfinity(str, num, options) {
  const isPositive = num === Infinity;
  switch (options.infinity.toLowerCase()) {
    case "null":
      return null;
    case "infinity":
      return num;
    // Return Infinity or -Infinity
    case "string":
      return isPositive ? "Infinity" : "-Infinity";
    case "original":
    default:
      return str;
  }
}

// node_modules/fast-xml-parser/src/ignoreAttributes.js
function getIgnoreAttributesFn(ignoreAttributes) {
  if (typeof ignoreAttributes === "function") {
    return ignoreAttributes;
  }
  if (Array.isArray(ignoreAttributes)) {
    return (attrName) => {
      for (const pattern of ignoreAttributes) {
        if (typeof pattern === "string" && attrName === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(attrName)) {
          return true;
        }
      }
    };
  }
  return () => false;
}

// node_modules/path-expression-matcher/src/Expression.js
var Expression = class {
  /**
   * Create a new Expression
   * @param {string} pattern - Pattern string (e.g., "root.users.user", "..user[id]")
   * @param {Object} options - Configuration options
   * @param {string} options.separator - Path separator (default: '.')
   */
  constructor(pattern, options = {}, data) {
    this.pattern = pattern;
    this.separator = options.separator || ".";
    this.segments = this._parse(pattern);
    this.data = data;
    this._hasDeepWildcard = this.segments.some((seg) => seg.type === "deep-wildcard");
    this._hasAttributeCondition = this.segments.some((seg) => seg.attrName !== void 0);
    this._hasPositionSelector = this.segments.some((seg) => seg.position !== void 0);
  }
  /**
   * Parse pattern string into segments
   * @private
   * @param {string} pattern - Pattern to parse
   * @returns {Array} Array of segment objects
   */
  _parse(pattern) {
    const segments = [];
    let i = 0;
    let currentPart = "";
    while (i < pattern.length) {
      if (pattern[i] === this.separator) {
        if (i + 1 < pattern.length && pattern[i + 1] === this.separator) {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
            currentPart = "";
          }
          segments.push({ type: "deep-wildcard" });
          i += 2;
        } else {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
          }
          currentPart = "";
          i++;
        }
      } else {
        currentPart += pattern[i];
        i++;
      }
    }
    if (currentPart.trim()) {
      segments.push(this._parseSegment(currentPart.trim()));
    }
    return segments;
  }
  /**
   * Parse a single segment
   * @private
   * @param {string} part - Segment string (e.g., "user", "ns::user", "user[id]", "ns::user:first")
   * @returns {Object} Segment object
   */
  _parseSegment(part) {
    const segment = { type: "tag" };
    let bracketContent = null;
    let withoutBrackets = part;
    const bracketMatch = part.match(/^([^\[]+)(\[[^\]]*\])(.*)$/);
    if (bracketMatch) {
      withoutBrackets = bracketMatch[1] + bracketMatch[3];
      if (bracketMatch[2]) {
        const content = bracketMatch[2].slice(1, -1);
        if (content) {
          bracketContent = content;
        }
      }
    }
    let namespace = void 0;
    let tagAndPosition = withoutBrackets;
    if (withoutBrackets.includes("::")) {
      const nsIndex = withoutBrackets.indexOf("::");
      namespace = withoutBrackets.substring(0, nsIndex).trim();
      tagAndPosition = withoutBrackets.substring(nsIndex + 2).trim();
      if (!namespace) {
        throw new Error(`Invalid namespace in pattern: ${part}`);
      }
    }
    let tag = void 0;
    let positionMatch = null;
    if (tagAndPosition.includes(":")) {
      const colonIndex = tagAndPosition.lastIndexOf(":");
      const tagPart = tagAndPosition.substring(0, colonIndex).trim();
      const posPart = tagAndPosition.substring(colonIndex + 1).trim();
      const isPositionKeyword = ["first", "last", "odd", "even"].includes(posPart) || /^nth\(\d+\)$/.test(posPart);
      if (isPositionKeyword) {
        tag = tagPart;
        positionMatch = posPart;
      } else {
        tag = tagAndPosition;
      }
    } else {
      tag = tagAndPosition;
    }
    if (!tag) {
      throw new Error(`Invalid segment pattern: ${part}`);
    }
    segment.tag = tag;
    if (namespace) {
      segment.namespace = namespace;
    }
    if (bracketContent) {
      if (bracketContent.includes("=")) {
        const eqIndex = bracketContent.indexOf("=");
        segment.attrName = bracketContent.substring(0, eqIndex).trim();
        segment.attrValue = bracketContent.substring(eqIndex + 1).trim();
      } else {
        segment.attrName = bracketContent.trim();
      }
    }
    if (positionMatch) {
      const nthMatch = positionMatch.match(/^nth\((\d+)\)$/);
      if (nthMatch) {
        segment.position = "nth";
        segment.positionValue = parseInt(nthMatch[1], 10);
      } else {
        segment.position = positionMatch;
      }
    }
    return segment;
  }
  /**
   * Get the number of segments
   * @returns {number}
   */
  get length() {
    return this.segments.length;
  }
  /**
   * Check if expression contains deep wildcard
   * @returns {boolean}
   */
  hasDeepWildcard() {
    return this._hasDeepWildcard;
  }
  /**
   * Check if expression has attribute conditions
   * @returns {boolean}
   */
  hasAttributeCondition() {
    return this._hasAttributeCondition;
  }
  /**
   * Check if expression has position selectors
   * @returns {boolean}
   */
  hasPositionSelector() {
    return this._hasPositionSelector;
  }
  /**
   * Get string representation
   * @returns {string}
   */
  toString() {
    return this.pattern;
  }
};

// node_modules/path-expression-matcher/src/ExpressionSet.js
var ExpressionSet = class {
  constructor() {
    this._byDepthAndTag = /* @__PURE__ */ new Map();
    this._wildcardByDepth = /* @__PURE__ */ new Map();
    this._deepWildcards = [];
    this._deepByTerminalTag = /* @__PURE__ */ new Map();
    this._patterns = /* @__PURE__ */ new Set();
    this._sealed = false;
  }
  /**
   * Add an Expression to the set.
   * Duplicate patterns (same pattern string) are silently ignored.
   *
   * @param {import('./Expression.js').default} expression - A pre-constructed Expression instance
   * @returns {this} for chaining
   * @throws {TypeError} if called after seal()
   *
   * @example
   * set.add(new Expression('root.users.user'));
   * set.add(new Expression('..script'));
   */
  add(expression) {
    if (this._sealed) {
      throw new TypeError(
        "ExpressionSet is sealed. Create a new ExpressionSet to add more expressions."
      );
    }
    if (this._patterns.has(expression.pattern)) return this;
    this._patterns.add(expression.pattern);
    if (expression.hasDeepWildcard()) {
      const lastSeg2 = expression.segments[expression.segments.length - 1];
      if (lastSeg2 && lastSeg2.type !== "deep-wildcard" && lastSeg2.tag !== "*") {
        const tag2 = lastSeg2.tag;
        if (!this._deepByTerminalTag.has(tag2)) this._deepByTerminalTag.set(tag2, []);
        this._deepByTerminalTag.get(tag2).push(expression);
      } else {
        this._deepWildcards.push(expression);
      }
      return this;
    }
    const depth = expression.length;
    const lastSeg = expression.segments[expression.segments.length - 1];
    const tag = lastSeg?.tag;
    if (!tag || tag === "*") {
      if (!this._wildcardByDepth.has(depth)) this._wildcardByDepth.set(depth, []);
      this._wildcardByDepth.get(depth).push(expression);
    } else {
      const key = `${depth}:${tag}`;
      if (!this._byDepthAndTag.has(key)) this._byDepthAndTag.set(key, []);
      this._byDepthAndTag.get(key).push(expression);
    }
    return this;
  }
  /**
   * Add multiple expressions at once.
   *
   * @param {import('./Expression.js').default[]} expressions - Array of Expression instances
   * @returns {this} for chaining
   *
   * @example
   * set.addAll([
   *   new Expression('root.users.user'),
   *   new Expression('root.config.setting'),
   * ]);
   */
  addAll(expressions) {
    for (const expr of expressions) this.add(expr);
    return this;
  }
  /**
   * Check whether a pattern string is already present in the set.
   *
   * @param {import('./Expression.js').default} expression
   * @returns {boolean}
   */
  has(expression) {
    return this._patterns.has(expression.pattern);
  }
  /**
   * Number of expressions in the set.
   * @type {number}
   */
  get size() {
    return this._patterns.size;
  }
  /**
   * Seal the set against further modifications.
   * Useful to prevent accidental mutations after config is built.
   * Calling add() or addAll() on a sealed set throws a TypeError.
   *
   * @returns {this}
   */
  seal() {
    this._sealed = true;
    return this;
  }
  /**
   * Whether the set has been sealed.
   * @type {boolean}
   */
  get isSealed() {
    return this._sealed;
  }
  /**
   * Test whether the matcher's current path matches any expression in the set.
   *
   * Evaluation order (cheapest → most expensive):
   *  1. Exact depth + tag bucket  — O(1) lookup, typically 0–2 expressions
   *  2. Depth-only wildcard bucket — O(1) lookup, rare
   *  3. Deep-wildcard list         — always checked, but usually small
   *
   * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
   * @returns {boolean} true if any expression matches the current path
   *
   * @example
   * if (stopNodes.matchesAny(matcher)) {
   *   // handle stop node
   * }
   */
  matchesAny(matcher) {
    return this.findMatch(matcher) !== null;
  }
  /**
  * Find and return the first Expression that matches the matcher's current path.
  *
  * Uses the same evaluation order as matchesAny (cheapest → most expensive):
  *  1. Exact depth + tag bucket
  *  2. Depth-only wildcard bucket
  *  3. Deep-wildcard list
  *
  * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
  * @returns {import('./Expression.js').default | null} the first matching Expression, or null
  *
  * @example
  * const expr = stopNodes.findMatch(matcher);
  * if (expr) {
  *   // access expr.config, expr.pattern, etc.
  * }
  */
  findMatch(matcher) {
    const depth = matcher.getDepth();
    const tag = matcher.getCurrentTag();
    const exactKey = `${depth}:${tag}`;
    const exactBucket = this._byDepthAndTag.get(exactKey);
    if (exactBucket) {
      for (let i = 0; i < exactBucket.length; i++) {
        if (matcher.matches(exactBucket[i])) return exactBucket[i];
      }
    }
    const wildcardBucket = this._wildcardByDepth.get(depth);
    if (wildcardBucket) {
      for (let i = 0; i < wildcardBucket.length; i++) {
        if (matcher.matches(wildcardBucket[i])) return wildcardBucket[i];
      }
    }
    const deepBucket = this._deepByTerminalTag.get(tag);
    if (deepBucket) {
      for (let i = 0; i < deepBucket.length; i++) {
        if (matcher.matches(deepBucket[i])) return deepBucket[i];
      }
    }
    for (let i = 0; i < this._deepWildcards.length; i++) {
      if (matcher.matches(this._deepWildcards[i])) return this._deepWildcards[i];
    }
    return null;
  }
};

// node_modules/path-expression-matcher/src/Matcher.js
var MatcherView = class {
  /**
   * @param {Matcher} matcher - The parent Matcher instance to read from.
   */
  constructor(matcher) {
    this._matcher = matcher;
  }
  /**
   * Get the path separator used by the parent matcher.
   * @returns {string}
   */
  get separator() {
    return this._matcher.separator;
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    const path = this._matcher.path;
    return path.length > 0 ? path[path.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    const path = this._matcher.path;
    return path.length > 0 ? path[path.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    const path = this._matcher.path;
    if (path.length === 0) return void 0;
    return path[path.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    const path = this._matcher.path;
    if (path.length === 0) return false;
    const current = path[path.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get the value of a "kept" attribute from the nearest ancestor (or
   * current node) that declared it via `push(tag, attrs, ns, { keep: [...] })`.
   * @param {string} attrName
   * @returns {*}
   */
  getAnyParentAttr(attrName) {
    return this._matcher.getAnyParentAttr(attrName);
  }
  /**
   * Check whether any ancestor (or the current node) kept the given
   * attribute via `push(tag, attrs, ns, { keep: [...] })`.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAnyParentAttr(attrName) {
    return this._matcher.hasAnyParentAttr(attrName);
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    const path = this._matcher.path;
    if (path.length === 0) return -1;
    return path[path.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    const path = this._matcher.path;
    if (path.length === 0) return -1;
    return path[path.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this._matcher.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    return this._matcher.toString(separator, includeNamespace);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this._matcher.path.map((n) => n.tag);
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    return this._matcher.matches(expression);
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this._matcher);
  }
};
var Matcher = class {
  /**
   * Create a new Matcher.
   * @param {Object} [options={}]
   * @param {string} [options.separator='.'] - Default path separator
   */
  constructor(options = {}) {
    this.separator = options.separator || ".";
    this.path = [];
    this.siblingStacks = [];
    this._pathStringCache = null;
    this._view = new MatcherView(this);
    this._keptAttrs = [];
  }
  /**
   * Push a new tag onto the path.
   * @param {string} tagName
   * @param {Object|null} [attrValues=null]
   * @param {string|null} [namespace=null]
   * @param {Object|null} [options=null]
   * @param {string[]} [options.keep] - Names of attributes (from attrValues)
   */
  push(tagName, attrValues = null, namespace = null, options = null) {
    this._pathStringCache = null;
    if (this.path.length > 0) {
      this.path[this.path.length - 1].values = void 0;
    }
    const currentLevel = this.path.length;
    let level = this.siblingStacks[currentLevel];
    if (!level) {
      level = { counts: /* @__PURE__ */ new Map(), total: 0 };
      this.siblingStacks[currentLevel] = level;
    }
    const siblingKey = namespace ? `${namespace}:${tagName}` : tagName;
    const counter = level.counts.get(siblingKey) || 0;
    const position = level.total;
    level.counts.set(siblingKey, counter + 1);
    level.total++;
    const node = {
      tag: tagName,
      position,
      counter
    };
    if (namespace !== null && namespace !== void 0) {
      node.namespace = namespace;
    }
    if (attrValues !== null && attrValues !== void 0) {
      node.values = attrValues;
    }
    this.path.push(node);
    const depth = this.path.length;
    const keep = options !== null ? options.keep : null;
    if (keep !== null && keep !== void 0 && keep.length > 0 && attrValues) {
      for (let i = 0; i < keep.length; i++) {
        const name = keep[i];
        if (attrValues[name] !== void 0) {
          this._keptAttrs.push({ depth, name, value: attrValues[name] });
        }
      }
    }
  }
  /**
   * Pop the last tag from the path.
   * @returns {Object|undefined} The popped node
   */
  pop() {
    if (this.path.length === 0) return void 0;
    this._pathStringCache = null;
    const node = this.path.pop();
    if (this.siblingStacks.length > this.path.length + 1) {
      this.siblingStacks.length = this.path.length + 1;
    }
    const poppedDepth = this.path.length + 1;
    while (this._keptAttrs.length > 0 && this._keptAttrs[this._keptAttrs.length - 1].depth >= poppedDepth) {
      this._keptAttrs.pop();
    }
    return node;
  }
  /**
   * Update current node's attribute values.
   * Useful when attributes are parsed after push.
   * @param {Object} attrValues
   */
  updateCurrent(attrValues) {
    if (this.path.length > 0) {
      const current = this.path[this.path.length - 1];
      if (attrValues !== null && attrValues !== void 0) {
        current.values = attrValues;
      }
    }
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    return this.path.length > 0 ? this.path[this.path.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    return this.path.length > 0 ? this.path[this.path.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    if (this.path.length === 0) return void 0;
    return this.path[this.path.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    if (this.path.length === 0) return false;
    const current = this.path[this.path.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get the value of a "kept" attribute from the nearest ancestor (or
   * current node) that declared it via `push(tag, attrs, ns, { keep: [...] })`.
   * Unlike getAttrValue(), this works regardless of how deep the path has
   * gone since the attribute was pushed — but only for attribute names that
   * were explicitly marked with `keep` at push time. Cost is proportional to
   * the number of currently-kept attributes (typically 0-3), not path depth.
   * @param {string} attrName
   * @returns {*} the value, or undefined if no ancestor kept this attribute
   */
  getAnyParentAttr(attrName) {
    const kept = this._keptAttrs;
    for (let i = kept.length - 1; i >= 0; i--) {
      if (kept[i].name === attrName) return kept[i].value;
    }
    return void 0;
  }
  /**
   * Check whether any ancestor (or the current node) kept the given
   * attribute via `push(tag, attrs, ns, { keep: [...] })`.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAnyParentAttr(attrName) {
    const kept = this._keptAttrs;
    for (let i = kept.length - 1; i >= 0; i--) {
      if (kept[i].name === attrName) return true;
    }
    return false;
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    if (this.path.length === 0) return -1;
    return this.path[this.path.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    if (this.path.length === 0) return -1;
    return this.path[this.path.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    const sep2 = separator || this.separator;
    const isDefault = sep2 === this.separator && includeNamespace === true;
    if (isDefault) {
      if (this._pathStringCache !== null) {
        return this._pathStringCache;
      }
      const result = this.path.map(
        (n) => n.namespace ? `${n.namespace}:${n.tag}` : n.tag
      ).join(sep2);
      this._pathStringCache = result;
      return result;
    }
    return this.path.map(
      (n) => includeNamespace && n.namespace ? `${n.namespace}:${n.tag}` : n.tag
    ).join(sep2);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this.path.map((n) => n.tag);
  }
  /**
   * Reset the path to empty.
   */
  reset() {
    this._pathStringCache = null;
    this.path = [];
    this.siblingStacks = [];
    this._keptAttrs = [];
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    const segments = expression.segments;
    if (segments.length === 0) {
      return false;
    }
    if (expression.hasDeepWildcard()) {
      return this._matchWithDeepWildcard(segments);
    }
    return this._matchSimple(segments);
  }
  /**
   * @private
   */
  _matchSimple(segments) {
    if (this.path.length !== segments.length) {
      return false;
    }
    for (let i = 0; i < segments.length; i++) {
      if (!this._matchSegment(segments[i], this.path[i], i === this.path.length - 1)) {
        return false;
      }
    }
    return true;
  }
  /**
   * @private
   */
  _matchWithDeepWildcard(segments) {
    let pathIdx = this.path.length - 1;
    let segIdx = segments.length - 1;
    while (segIdx >= 0 && pathIdx >= 0) {
      const segment = segments[segIdx];
      if (segment.type === "deep-wildcard") {
        segIdx--;
        if (segIdx < 0) {
          return true;
        }
        const nextSeg = segments[segIdx];
        let found = false;
        for (let i = pathIdx; i >= 0; i--) {
          if (this._matchSegment(nextSeg, this.path[i], i === this.path.length - 1)) {
            pathIdx = i - 1;
            segIdx--;
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      } else {
        if (!this._matchSegment(segment, this.path[pathIdx], pathIdx === this.path.length - 1)) {
          return false;
        }
        pathIdx--;
        segIdx--;
      }
    }
    return segIdx < 0;
  }
  /**
   * @private
   */
  _matchSegment(segment, node, isCurrentNode) {
    if (segment.tag !== "*" && segment.tag !== node.tag) {
      return false;
    }
    if (segment.namespace !== void 0) {
      if (segment.namespace !== "*" && segment.namespace !== node.namespace) {
        return false;
      }
    }
    if (segment.attrName !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      if (!node.values || !(segment.attrName in node.values)) {
        return false;
      }
      if (segment.attrValue !== void 0) {
        if (String(node.values[segment.attrName]) !== String(segment.attrValue)) {
          return false;
        }
      }
    }
    if (segment.position !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      const counter = node.counter ?? 0;
      if (segment.position === "first" && counter !== 0) {
        return false;
      } else if (segment.position === "odd" && counter % 2 !== 1) {
        return false;
      } else if (segment.position === "even" && counter % 2 !== 0) {
        return false;
      } else if (segment.position === "nth" && counter !== segment.positionValue) {
        return false;
      }
    }
    return true;
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this);
  }
  /**
   * Create a snapshot of current state.
   * @returns {Object}
   */
  snapshot() {
    return {
      path: this.path.map((node) => ({ ...node })),
      siblingStacks: this.siblingStacks.map((level) => level ? { counts: new Map(level.counts), total: level.total } : level),
      keptAttrs: this._keptAttrs.map((entry) => ({ ...entry }))
    };
  }
  /**
   * Restore state from snapshot.
   * @param {Object} snapshot
   */
  restore(snapshot) {
    this._pathStringCache = null;
    this.path = snapshot.path.map((node) => ({ ...node }));
    this.siblingStacks = snapshot.siblingStacks.map((level) => level ? { counts: new Map(level.counts), total: level.total } : level);
    this._keptAttrs = (snapshot.keptAttrs || []).map((entry) => ({ ...entry }));
  }
  /**
   * Return the read-only {@link MatcherView} for this matcher.
   *
   * The same instance is returned on every call — no allocation occurs.
   * It always reflects the current parser state and is safe to pass to
   * user callbacks without risk of accidental mutation.
   *
   * @returns {MatcherView}
   *
   * @example
   * const view = matcher.readOnly();
   * // pass view to callbacks — it stays in sync automatically
   * view.matches(expr);       // ✓
   * view.getCurrentTag();     // ✓
   * // view.push(...)         // ✗ method does not exist — caught by TypeScript
   */
  readOnly() {
    return this._view;
  }
};

// node_modules/is-unsafe/src/contexts/html.js
var HTML_PATTERNS = [
  {
    id: "html-script-open",
    description: "<script opening tag",
    pattern: /<script[\s>/]/i
  },
  {
    id: "html-script-close",
    description: "</script closing tag",
    pattern: /<\/script[\s>]/i
  },
  {
    id: "html-javascript-protocol",
    description: "javascript: URI scheme (with optional whitespace/encoding)",
    // Handles j&#x61;vascript:, j\u0061vascript:, and whitespace variants
    pattern: /j[\t\n\r ]*a[\t\n\r ]*v[\t\n\r ]*a[\t\n\r ]*s[\t\n\r ]*c[\t\n\r ]*r[\t\n\r ]*i[\t\n\r ]*p[\t\n\r ]*t[\t\n\r ]*:/i
  },
  {
    id: "html-vbscript-protocol",
    description: "vbscript: URI scheme",
    pattern: /vbscript[\t\n\r ]*:/i
  },
  {
    id: "html-data-html",
    description: "data:text/html URI \u2014 can execute scripts in browsers",
    pattern: /data[\t\n\r ]*:[\t\n\r ]*text\/html/i
  },
  {
    id: "html-data-xhtml",
    description: "data:application/xhtml+xml URI",
    pattern: /data[\t\n\r ]*:[\t\n\r ]*application\/xhtml/i
  },
  {
    id: "html-data-svg",
    description: "data:image/svg+xml URI \u2014 can execute scripts",
    pattern: /data[\t\n\r ]*:[\t\n\r ]*image\/svg\+xml/i
  },
  {
    id: "html-inline-event-handler",
    description: "Inline event handler attributes: onclick=, onerror=, onload=, etc.",
    // \bon ensures we match a word boundary so "phonetic=" is not caught
    pattern: /\bon\w{1,30}\s*=/i
  },
  {
    id: "html-entity-obfuscated-script",
    description: "HTML-entity-encoded <script (e.g. &#x3C;script or &lt;script)",
    // Entities include optional trailing semicolon: &#x3C; or &#x3C (both valid in HTML5)
    pattern: /(?:&#x0*3[Cc];?|&#0*60;?|&lt;)\s*script/i
  },
  {
    id: "html-entity-obfuscated-javascript",
    description: 'HTML-entity-encoded javascript: (partial \u2014 catches common &#106; or &#x6a; for "j")',
    pattern: /(?:&#x0*6[Aa];?|&#0*106;?)\s*(?:&#x0*61;?|a)[\s\S]{0,80}script\s*:/i
  },
  {
    id: "html-style-expression",
    description: "CSS expression() \u2014 IE-era code execution in style attributes",
    pattern: /style[\s\S]{0,20}expression\s*\(/i
  },
  {
    id: "html-object-embed",
    description: "<object or <embed tags that can load active content",
    pattern: /<(?:object|embed)[\s>/]/i
  },
  {
    id: "html-base-tag",
    description: "<base href= \u2014 can hijack all relative URLs on a page",
    pattern: /<base[\s>]/i
  },
  {
    id: "html-meta-refresh",
    description: '<meta http-equiv="refresh" \u2014 can redirect users',
    pattern: /<meta[\s\S]{0,40}http-equiv[\s\S]{0,20}refresh/i
  },
  {
    id: "html-srcdoc",
    description: "srcdoc= attribute on iframes \u2014 embeds HTML that can run scripts",
    pattern: /srcdoc\s*=/i
  },
  {
    id: "html-iframe",
    description: "<iframe tag",
    pattern: /<iframe[\s>/]/i
  },
  {
    id: "html-form",
    description: "<form tag \u2014 can be used for phishing / credential harvesting injection",
    pattern: /<form[\s>/]/i
  }
];
var html_default = HTML_PATTERNS;

// node_modules/is-unsafe/src/contexts/xml.js
var XML_PATTERNS = [
  {
    id: "xml-cdata-injection",
    description: "CDATA section injection: <![CDATA[ breaks out of text node context",
    pattern: /<!\[CDATA\[/i
  },
  {
    id: "xml-cdata-close",
    description: "CDATA close sequence: ]]> can terminate an enclosing CDATA section",
    pattern: /\]\]>/
  },
  {
    id: "xml-processing-instruction",
    description: "XML processing instruction: <?xml-stylesheet or <?php etc.",
    pattern: /<\?(?:xml[\- ]|php|asp)/i
  },
  {
    id: "xml-doctype-injection",
    description: "DOCTYPE declaration embedded in content \u2014 can define entities",
    // Match <!DOCTYPE followed by end-of-string, whitespace, or [ (internal subset)
    pattern: /<!DOCTYPE(?:[\s[]|$)/i
  },
  {
    id: "xml-entity-system",
    description: "SYSTEM keyword \u2014 used in external entity declarations (XXE)",
    pattern: /\bSYSTEM\s+["']/i
  },
  {
    id: "xml-entity-public",
    description: "PUBLIC keyword \u2014 used in external entity declarations (XXE)",
    pattern: /\bPUBLIC\s+["']/i
  },
  {
    id: "xml-entity-declaration",
    description: "<!ENTITY declaration \u2014 defines entities, potential XXE or entity expansion",
    pattern: /<!ENTITY[\s%]/i
  },
  {
    id: "xml-billion-laughs",
    description: "Entity reference chaining / billion laughs: repeated &eX; style references",
    // Heuristic: 3+ consecutive entity refs suggests expansion attack
    pattern: /(?:&\w{1,20};){3,}/
  },
  {
    id: "xml-namespace-confusion",
    description: "xmlns: attribute injection \u2014 can redefine namespaces to confuse parsers",
    // pattern: /\bxmlns\s*(?::\w{1,40})?\s*=/i,
    pattern: /\bxmlns(?::\w{1,40})?\s*=/i
  },
  {
    id: "xml-comment-injection",
    description: "<!-- comment injection \u2014 can hide content from some parsers",
    pattern: /<!--/
  },
  {
    id: "xml-comment-close",
    description: "--> closes an enclosing XML comment",
    pattern: /-->/
  },
  {
    id: "xml-pi-close",
    description: "?> closes an enclosing processing instruction",
    pattern: /\?>/
  }
];
var xml_default = XML_PATTERNS;

// node_modules/is-unsafe/src/contexts/svg.js
var SVG_PATTERNS = [
  {
    id: "svg-script-element",
    description: "<script element inside SVG executes JavaScript",
    pattern: /<script[\s>/]/i
  },
  {
    id: "svg-xlink-href-javascript",
    description: "xlink:href with javascript: \u2014 classic SVG XSS via <a> or <use>",
    pattern: /xlink\s*:\s*href\s*=\s*["']?\s*javascript\s*:/i
  },
  {
    id: "svg-href-javascript",
    description: "href= with javascript: in SVG context (<a>, <animate>, etc.)",
    pattern: /href\s*=\s*["']?\s*javascript\s*:/i
  },
  {
    id: "svg-foreignobject",
    description: "<foreignObject embeds HTML inside SVG \u2014 can execute scripts",
    pattern: /<foreignObject[\s>/]/i
  },
  {
    id: "svg-use-external",
    description: "<use xlink:href or href pointing to external resource (non-fragment URL)",
    // Match <use with href= where the value starts with a non-# character (external URL)
    // [\"'][^#] catches quoted values not starting with #; [^\"'#\s>] catches unquoted
    pattern: /<use[\s\S]{0,60}(?:xlink\s*:\s*)?href\s*=\s*(?:["'][^#]|[^"'#\s>])/i
  },
  {
    id: "svg-animate-href",
    description: '<animate attributeName="href" \u2014 can dynamically change href to javascript:',
    pattern: /<animate[\s\S]{0,80}attributeName\s*=\s*["'][\s]*href["']/i
  },
  {
    id: "svg-animate-xlinkhref",
    description: '<animate attributeName="xlink:href"',
    pattern: /<animate[\s\S]{0,80}attributeName\s*=\s*["'][\s]*xlink\s*:\s*href["']/i
  },
  {
    id: "svg-set-javascript",
    description: '<set to="javascript:..." \u2014 sets an attribute to a javascript: URI',
    pattern: /<set[\s\S]{0,80}to\s*=\s*["']?\s*javascript\s*:/i
  },
  {
    id: "svg-event-handler",
    description: "SVG-specific event handler attributes: onload=, onerror=, onactivate=, etc.",
    pattern: /\bon(?:load|error|activate|begin|end|repeat|focus|blur|click|mouse\w{1,20}|key\w{1,20})\s*=/i
  },
  {
    id: "svg-handler-generic",
    description: "Generic on* handler catch-all for SVG attributes",
    pattern: /\bon\w{1,30}\s*=/i
  },
  {
    id: "svg-filter-feimage",
    description: "<feImage href= \u2014 filter primitive that can load external resources",
    pattern: /<feImage[\s\S]{0,80}(?:xlink\s*:\s*)?href\s*=/i
  },
  {
    id: "svg-image-external",
    description: "<image xlink:href with http/https or javascript protocol",
    pattern: /<image[\s\S]{0,80}(?:xlink\s*:\s*)?href\s*=\s*["']?\s*(?:https?|javascript)\s*:/i
  },
  {
    id: "svg-style-javascript",
    description: "style= attribute containing javascript: (e.g. background:url(javascript:...))",
    pattern: /style\s*=[\s\S]{0,60}javascript\s*:/i
  }
];
var svg_default = SVG_PATTERNS;

// node_modules/is-unsafe/src/contexts/sql.js
var SQL_PATTERNS = [
  {
    id: "sql-block-comment-open",
    description: "SQL block comment open: /* ... */ \u2014 unusual in legitimate user text",
    pattern: /\/\*/
  },
  {
    id: "sql-union-select",
    description: "UNION SELECT \u2014 most common SQL injection aggregation attack",
    pattern: /\bUNION\s{1,20}(?:ALL\s{1,20})?SELECT\b/i
  },
  {
    id: "sql-drop-table",
    description: "DROP TABLE \u2014 destructive DDL injection",
    pattern: /\bDROP\s{1,20}TABLE\b/i
  },
  {
    id: "sql-drop-database",
    description: "DROP DATABASE \u2014 destructive DDL injection",
    pattern: /\bDROP\s{1,20}DATABASE\b/i
  },
  {
    id: "sql-insert-into",
    description: "INSERT INTO \u2014 data injection",
    pattern: /\bINSERT\s{1,20}INTO\b/i
  },
  {
    id: "sql-delete-from",
    description: "DELETE FROM \u2014 data deletion injection",
    pattern: /\bDELETE\s{1,20}FROM\b/i
  },
  {
    id: "sql-update-set",
    description: "UPDATE ... SET \u2014 data modification injection",
    // Allows arbitrary content between UPDATE and SET (table name, alias, etc.)
    pattern: /\bUPDATE\b[\s\S]{1,60}\bSET\b/i
  },
  {
    id: "sql-exec-xp",
    description: "EXEC xp_ \u2014 MSSQL extended stored procedure execution",
    pattern: /\bEXEC(?:UTE)?\s{1,20}xp_/i
  },
  {
    id: "sql-tautology-string",
    description: `Classic string tautology: ' OR '1'='1 or " OR "1"="1"`,
    // Last quote is optional — injection may truncate it: ' OR '1'='1--
    pattern: /'\s{0,10}OR\s{0,10}'[^']{0,20}'\s*=\s*'[^']{0,20}/i
  },
  {
    id: "sql-tautology-numeric",
    description: "Numeric tautology: OR 1=1",
    pattern: /\bOR\s{1,10}1\s*=\s*1\b/i
  },
  {
    id: "sql-always-true-zero",
    description: "Numeric tautology: OR 0=0",
    pattern: /\bOR\s{1,10}0\s*=\s*0\b/i
  },
  {
    id: "sql-sleep-benchmark",
    description: "Time-based blind injection: SLEEP() or BENCHMARK()",
    pattern: /\b(?:SLEEP|BENCHMARK)\s*\(/i
  },
  {
    id: "sql-waitfor-delay",
    description: "MSSQL time-based blind injection: WAITFOR DELAY",
    pattern: /\bWAITFOR\s{1,20}DELAY\b/i
  },
  {
    id: "sql-char-function",
    description: "CHAR() function \u2014 used to obfuscate injected strings",
    pattern: /\bCHAR\s*\(\s*\d{1,3}/i
  },
  {
    id: "sql-information-schema",
    description: "INFORMATION_SCHEMA \u2014 reconnaissance query for table/column enumeration",
    pattern: /\bINFORMATION_SCHEMA\b/i
  }
];
var sql_default = SQL_PATTERNS;

// node_modules/is-unsafe/src/contexts/shell.js
var SHELL_PATTERNS = [
  {
    id: "shell-path-traversal-unix",
    description: "Unix path traversal: ../  \u2014 climbing the directory tree",
    pattern: /\.\.\//
  },
  {
    id: "shell-path-traversal-windows",
    description: "Windows path traversal: ..\\ \u2014 climbing the directory tree",
    pattern: /\.\.\\/
  },
  {
    id: "shell-path-traversal-encoded",
    description: "URL-encoded path traversal: %2e%2e or %2f variants",
    pattern: /%2e%2e|%2f\.\.|\.\.%2f/i
  },
  {
    id: "shell-null-byte",
    description: "Null byte injection: \\x00 or %00 \u2014 truncates strings in C-backed functions",
    pattern: /\x00|%00/
  },
  {
    id: "shell-semicolon",
    description: "Semicolon command separator: cmd1; cmd2",
    pattern: /;/
  },
  {
    id: "shell-pipe",
    description: "Pipe operator: cmd1 | cmd2",
    pattern: /\|/
  },
  {
    id: "shell-and-operator",
    description: "AND operator: cmd1 && cmd2",
    pattern: /&&/
  },
  {
    id: "shell-or-operator",
    description: "OR operator: cmd1 || cmd2",
    pattern: /\|\|/
  },
  {
    id: "shell-backtick",
    description: "Backtick command substitution: `cmd`",
    pattern: /`/
  },
  {
    id: "shell-dollar-paren",
    description: "Dollar-paren command substitution: $(cmd)",
    pattern: /\$\(/
  },
  {
    id: "shell-dollar-brace",
    description: "Dollar-brace variable expansion: ${var} \u2014 can be abused for injection",
    pattern: /\$\{/
  },
  {
    id: "shell-redirect-out",
    description: "Output redirection: cmd > file or cmd >> file",
    pattern: />{1,2}/
  },
  {
    id: "shell-redirect-in",
    description: "Input redirection: cmd < file",
    pattern: /</
  },
  {
    id: "shell-newline-injection",
    description: "Newline injection: \\n or \\r \u2014 can inject new shell commands",
    pattern: /[\n\r]/
  },
  {
    id: "shell-glob-star",
    description: "Glob expansion: * or ? \u2014 can expand to unintended files",
    // Only flag when combined with path separators to reduce false positives
    pattern: /[/\\][*?]/
  },
  {
    id: "shell-absolute-root",
    description: "Absolute root path injection: string starting with / or \\ (Windows UNC)",
    pattern: /^(?:\/|\\\\)/
  },
  {
    id: "shell-windows-drive",
    description: "Windows drive letter path injection: C:\\ or D:/",
    pattern: /^[a-zA-Z]:[/\\]/
  },
  {
    id: "shell-curl-wget",
    description: "curl/wget with URL or flags \u2014 can exfiltrate data or download payloads",
    // Require a URL scheme (http/https/ftp) or a flag (-) to reduce false positives
    // "curl is a tool" won't match; "curl http://..." or "curl -s ..." will
    pattern: /\b(?:curl|wget)\s+(?:https?:\/\/|ftp:\/\/|-)/i
  }
];
var shell_default = SHELL_PATTERNS;

// node_modules/is-unsafe/src/contexts/redos.js
var REDOS_PATTERNS = [
  {
    id: "redos-nested-quantifier-plus",
    description: "Nested + quantifier inside a group with outer quantifier: (a+)+, (.+b)*, etc.",
    // Matches any group containing a + quantifier, with an outer * or + — catches (a+)+, (.+b)*, etc.
    pattern: /\([^)]*\+[^)]*\)[+*]/
  },
  {
    id: "redos-nested-quantifier-star",
    description: "Nested * quantifier: (a*)* or (a*)+ \u2014 catastrophic backtracking",
    pattern: /\([^)]*\*[^)]*\)[*+]/
  },
  {
    id: "redos-nested-groups",
    description: "Doubly nested quantified groups: ((a+)+) \u2014 guaranteed catastrophic",
    pattern: /\(\([^)]{0,40}\)[+*]\)[+*]/
  },
  {
    id: "redos-alternation-overlap",
    description: "Overlapping alternation under quantifier: (a|a)+ \u2014 ambiguous NFA paths",
    // Detect repeated identical alternatives under a quantifier
    pattern: /\(([^|()]{1,20})\|(?:\1)(?:\|[^|()]{1,20}){0,5}\)[+*?]{1,2}/
  },
  {
    id: "redos-star-plus-concat",
    description: "(x*x)+ pattern \u2014 triggers super-linear backtracking",
    pattern: /\([^)]{0,10}\*[^)]{0,10}\)[+*]/
  },
  {
    id: "redos-dot-star-greedy",
    description: "(.*){n,} or (.+){n,} \u2014 repeated greedy dot quantifiers",
    pattern: /\(\.[*+]\)\{?\d/
  },
  {
    id: "redos-large-repetition",
    description: "Very large fixed or range repetition count {1000,} or {1000,n} \u2014 denial of service via backtracking",
    // Matches { followed by 4+ digits (≥1000), then optional ,digits }
    pattern: /\{\d{4,}(?:,\d*)?\}/
  },
  {
    id: "redos-catastrophic-alternation",
    description: "Long alternation with many similar branches \u2014 polynomial backtracking risk",
    // Heuristic: 10+ pipe-separated alternatives in a single group
    pattern: /\([^)]{0,200}(?:\|[^|)]{0,50}){9,}\)/
  }
];
var redos_default = REDOS_PATTERNS;

// node_modules/is-unsafe/src/contexts/nosql.js
var sep = `["'\\s]*:`;
var NOSQL_PATTERNS = [
  // ─── MongoDB $ operator injection ────────────────────────────────────────
  {
    id: "nosql-where-operator",
    description: "$where \u2014 executes arbitrary JavaScript server-side in MongoDB",
    pattern: new RegExp(`\\$where${sep}`, "i")
  },
  {
    id: "nosql-ne-operator",
    description: '$ne \u2014 "not equal" operator used to bypass equality checks',
    pattern: new RegExp(`\\$ne${sep}`, "i")
  },
  {
    id: "nosql-gt-operator",
    description: '$gt \u2014 "greater than" used to bypass password/value checks',
    pattern: new RegExp(`\\$gte?${sep}`, "i")
  },
  {
    id: "nosql-lt-operator",
    description: '$lt / $lte \u2014 "less than" bypass variants',
    pattern: new RegExp(`\\$lte?${sep}`, "i")
  },
  {
    id: "nosql-regex-operator",
    description: "$regex \u2014 can be used to extract data character by character (blind injection)",
    pattern: new RegExp(`\\$regex${sep}`, "i")
  },
  {
    id: "nosql-or-operator",
    description: "$or \u2014 logical OR; used to create always-true conditions",
    pattern: new RegExp(`\\$or${sep}\\s*\\[`, "i")
  },
  {
    id: "nosql-and-operator",
    description: "$and \u2014 logical AND operator injection",
    pattern: new RegExp(`\\$and${sep}\\s*\\[`, "i")
  },
  {
    id: "nosql-nor-operator",
    description: "$nor \u2014 logical NOR operator injection",
    pattern: new RegExp(`\\$nor${sep}\\s*\\[`, "i")
  },
  {
    id: "nosql-exists-operator",
    description: "$exists \u2014 can enumerate fields to determine schema",
    pattern: new RegExp(`\\$exists${sep}`, "i")
  },
  {
    id: "nosql-in-operator",
    description: "$in \u2014 matches any value in a list; can enumerate values",
    pattern: new RegExp(`\\$in${sep}\\s*\\[`, "i")
  },
  {
    id: "nosql-expr-operator",
    description: "$expr \u2014 allows aggregation expressions in queries (MongoDB 3.6+)",
    pattern: new RegExp(`\\$expr${sep}`, "i")
  },
  {
    id: "nosql-function-operator",
    description: "$function \u2014 executes arbitrary JavaScript in MongoDB 4.4+",
    pattern: new RegExp(`\\$function${sep}`, "i")
  },
  {
    id: "nosql-accumulator-operator",
    description: "$accumulator \u2014 custom aggregation with arbitrary JS execution",
    pattern: new RegExp(`\\$accumulator${sep}`, "i")
  },
  // ─── Prototype pollution ─────────────────────────────────────────────────
  {
    id: "nosql-proto-pollution",
    description: "__proto__ \u2014 prototype pollution via object key injection",
    pattern: /__proto__/
  },
  {
    id: "nosql-constructor-prototype",
    description: "constructor.prototype \u2014 alternative prototype pollution vector (dot notation or JSON key)",
    // Matches dot-notation (obj.constructor.prototype) and JSON key adjacency
    // ("constructor": {"prototype": ...})
    pattern: /constructor[\s"':.,{\[]*prototype/i
  },
  {
    id: "nosql-proto-bracket",
    description: '["__proto__"] \u2014 bracket-notation prototype pollution',
    pattern: /\[["']__proto__["']\]/
  }
];
var nosql_default = NOSQL_PATTERNS;

// node_modules/is-unsafe/src/contexts/log.js
var LOG_PATTERNS = [
  // ─── CRLF / newline injection ─────────────────────────────────────────────
  {
    id: "log-crlf-injection",
    description: "CRLF injection: literal \\r or \\n embeds fake log lines",
    pattern: /[\r\n]/
  },
  {
    id: "log-url-encoded-crlf",
    description: "URL-encoded CRLF: %0d, %0a, %0D, %0A \u2014 decoded by some log parsers",
    pattern: /%0[dDaA]/
  },
  {
    id: "log-unicode-newline",
    description: "Unicode newline variants: U+2028 (line separator), U+2029 (paragraph separator)",
    pattern: /[\u2028\u2029]/
  },
  // ─── Log4Shell / JNDI injection (CVE-2021-44228) ─────────────────────────
  {
    id: "log-log4shell-jndi",
    description: "Log4Shell: ${jndi:...} triggers remote code execution in Apache Log4j",
    pattern: /\$\{jndi\s*:/i
  },
  {
    id: "log-log4shell-obfuscated",
    description: "Obfuscated Log4Shell: ${::-j}... lookup-bypass prefix used to evade WAF detection",
    // ${::- is the Log4j lookup-bypass escape sequence; presence alone is suspicious
    pattern: /\$\{::-/
  },
  {
    id: "log-log4j-lookup",
    description: "Log4j lookup syntax: ${env:...}, ${sys:...}, ${ctx:...} \u2014 data exfiltration",
    pattern: /\$\{(?:env|sys|ctx|main|map|sd|web|docker|k8s|spring)\s*:/i
  },
  // ─── Server-Side Template Injection (SSTI) in log messages ───────────────
  {
    id: "log-ssti-double-brace",
    description: "SSTI double-brace: {{expression}} \u2014 Jinja2, Twig, Handlebars, etc.",
    pattern: /\{\{[\s\S]{0,80}\}\}/
  },
  {
    id: "log-ssti-hash-brace",
    description: "SSTI hash-brace: #{expression} \u2014 Thymeleaf, Velocity, Ruby ERB",
    pattern: /#\{[\s\S]{0,80}\}/
  },
  {
    id: "log-ssti-dollar-brace",
    description: "SSTI/EL injection: ${expression with operators or method calls} \u2014 JSP EL, Freemarker, SpEL",
    // Require that the ${...} content looks like an expression, not a plain variable name.
    // Flags if the content contains: . ( * + operators, or known SSTI keywords.
    // This avoids flagging ${PATH}, ${HOME} etc. (plain shell variables).
    pattern: /\$\{[^}]*(?:\.|\(|\*|\+|\bclass\b|\bruntime\b|\bprocess\b|\bexec\b)[^}]{0,80}\}/i
  },
  {
    id: "log-ssti-percent-tag",
    description: "SSTI ERB/ASP tag: <%= expression %> \u2014 Ruby ERB, ASP",
    pattern: /<%=[\s\S]{0,80}%>/
  },
  // ─── Null byte ────────────────────────────────────────────────────────────
  {
    id: "log-null-byte",
    description: "Null byte: \\x00 or %00 \u2014 can truncate log entries in C-backed loggers",
    pattern: /\x00|%00/
  },
  // ─── ANSI escape injection ────────────────────────────────────────────────
  {
    id: "log-ansi-escape",
    description: "ANSI escape sequence: ESC[ \u2014 can manipulate terminal output when logs are tailed",
    pattern: /\x1b\[/
  }
];
var log_default = LOG_PATTERNS;

// node_modules/is-unsafe/src/contexts/sql-strict.js
var SQL_STRICT_EXTRA = [
  {
    id: "sql-line-comment",
    description: "SQL line comment: -- followed by whitespace or end of string",
    pattern: /--(?:\s|$)/
  },
  {
    id: "sql-stacked-query",
    description: "Stacked queries: semicolon immediately followed by a SQL keyword",
    pattern: /;\s{0,10}(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b/i
  },
  {
    id: "sql-hex-encoding",
    description: "Hex-encoded string injection: 0x41414141 style (MySQL)",
    pattern: /\b0x[0-9a-f]{4,}/i
  }
];
var SQL_STRICT_PATTERNS = [...sql_default, ...SQL_STRICT_EXTRA];
var sql_strict_default = SQL_STRICT_PATTERNS;

// node_modules/is-unsafe/src/index.js
html_default.label = "HTML";
xml_default.label = "XML";
svg_default.label = "SVG";
sql_default.label = "SQL";
sql_strict_default.label = "SQL-STRICT";
shell_default.label = "SHELL";
redos_default.label = "REDOS";
nosql_default.label = "NOSQL";
log_default.label = "LOG";
var VALID_CONTEXTS = Object.freeze({
  HTML: html_default,
  XML: xml_default,
  SVG: svg_default,
  SQL: sql_default,
  "SQL-STRICT": sql_strict_default,
  SHELL: shell_default,
  REDOS: redos_default,
  NOSQL: nosql_default,
  LOG: log_default
});
function assertString(value) {
  if (typeof value !== "string") {
    throw new TypeError(
      `is-unsafe: first argument must be a string, got ${typeof value}`
    );
  }
}
function assertContext(context) {
  if (context instanceof RegExp) return;
  if (Array.isArray(context)) {
    if (context.length === 0) {
      throw new TypeError("is-unsafe: context must not be an empty array");
    }
    if (Array.isArray(context[0])) {
      for (const list of context) {
        if (!Array.isArray(list) || list.length === 0) {
          throw new TypeError(
            "is-unsafe: each context in the array must be a non-empty pattern array (PatternList)"
          );
        }
      }
    }
    return;
  }
  throw new TypeError(
    `is-unsafe: second argument must be a PatternList (e.g. HTML), an array of PatternLists (e.g. [HTML, XML]), or a RegExp. Got: ${typeof context}`
  );
}
function normalise(context) {
  if (context instanceof RegExp) return { lists: null, regex: context };
  if (Array.isArray(context[0])) return { lists: context, regex: null };
  return { lists: [context], regex: null };
}
function matchList(value, list) {
  const label = list.label ?? "CUSTOM";
  for (const rule of list) {
    if (rule.pattern.test(value)) {
      return { context: label, id: rule.id, description: rule.description, pattern: rule.pattern };
    }
  }
  return null;
}
function isUnsafe(value, context) {
  assertString(value);
  assertContext(context);
  const { lists, regex } = normalise(context);
  if (regex) return regex.test(value);
  for (const list of lists) {
    if (matchList(value, list) !== null) return true;
  }
  return false;
}

// node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
function extractRawAttributes(prefixedAttrs, options) {
  if (!prefixedAttrs) return {};
  const attrs = options.attributesGroupName ? prefixedAttrs[options.attributesGroupName] : prefixedAttrs;
  if (!attrs) return {};
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(options.attributeNamePrefix)) {
      const rawName = key.substring(options.attributeNamePrefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function extractNamespace(rawTagName) {
  if (!rawTagName || typeof rawTagName !== "string") return void 0;
  const colonIndex = rawTagName.indexOf(":");
  if (colonIndex !== -1 && colonIndex > 0) {
    const ns = rawTagName.substring(0, colonIndex);
    if (ns !== "xmlns") {
      return ns;
    }
  }
  return void 0;
}
var OrderedObjParser = class {
  constructor(options, externalEntities) {
    this.options = options;
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.parseXml = parseXml;
    this.parseTextData = parseTextData;
    this.resolveNameSpace = resolveNameSpace;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
    this.addChild = addChild;
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
    this.entityExpansionCount = 0;
    this.currentExpandedLength = 0;
    this.doctypefound = false;
    let namedEntities = { ...XML };
    if (this.options.entityDecoder) {
      this.entityDecoder = this.options.entityDecoder;
    } else {
      if (typeof this.options.htmlEntities === "object") namedEntities = this.options.htmlEntities;
      else if (this.options.htmlEntities === true) namedEntities = { ...COMMON_HTML, ...CURRENCY };
      this.entityDecoder = new EntityDecoder({
        namedEntities: { ...namedEntities, ...externalEntities },
        numericAllowed: this.options.htmlEntities,
        limit: {
          maxTotalExpansions: this.options.processEntities.maxTotalExpansions,
          maxExpandedLength: this.options.processEntities.maxExpandedLength,
          applyLimitsTo: this.options.processEntities.appliesTo
        },
        // onExternalEntity: (name, value) => isUnsafe(value) ? 'block' : 'allow',
        onInputEntity: (name, value) => (
          //TODO: VALID_CONTEXTS.HTML should be set only if this.options.htmlEntities
          isUnsafe(value, [html_default, xml_default]) ? ENTITY_ACTION.BLOCK : ENTITY_ACTION.ALLOW
        )
        //postCheck: resolved => resolved
      });
    }
    this.matcher = new Matcher();
    this.readonlyMatcher = this.matcher.readOnly();
    this.isCurrentNodeStopNode = false;
    this.stopNodeExpressionsSet = new ExpressionSet();
    const stopNodesOpts = this.options.stopNodes;
    if (stopNodesOpts && stopNodesOpts.length > 0) {
      for (let i = 0; i < stopNodesOpts.length; i++) {
        const stopNodeExp = stopNodesOpts[i];
        if (typeof stopNodeExp === "string") {
          this.stopNodeExpressionsSet.add(new Expression(stopNodeExp));
        } else if (stopNodeExp instanceof Expression) {
          this.stopNodeExpressionsSet.add(stopNodeExp);
        }
      }
      this.stopNodeExpressionsSet.seal();
    }
  }
};
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
  const options = this.options;
  if (val !== void 0) {
    if (options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities) val = this.replaceEntitiesValue(val, tagName, jPath);
      const jPathOrMatcher = options.jPath ? jPath.toString() : jPath;
      const newval = options.tagValueProcessor(tagName, val, jPathOrMatcher, hasAttributes, isLeafNode);
      if (newval === null || newval === void 0) {
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        return newval;
      } else if (options.trimValues) {
        return parseValue3(val, options.parseTagValue, options.numberParseOptions);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue3(val, options.parseTagValue, options.numberParseOptions);
        } else {
          return val;
        }
      }
    }
  }
}
function resolveNameSpace(tagname) {
  if (this.options.removeNSPrefix) {
    const tags = tagname.split(":");
    const prefix = tagname.charAt(0) === "/" ? "/" : "";
    if (tags[0] === "xmlns") {
      return "";
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}
var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function buildAttributesMap(attrStr, jPath, tagName, force = false) {
  const options = this.options;
  if (force === true || options.ignoreAttributes !== true && typeof attrStr === "string") {
    const matches = getAllMatches(attrStr, attrsRegx);
    const len = matches.length;
    const attrs = {};
    const processedVals = new Array(len);
    let hasRawAttrs = false;
    const rawAttrsForMatcher = {};
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      const oldVal = matches[i][4];
      if (attrName.length && oldVal !== void 0) {
        let val = oldVal;
        if (options.trimValues) val = val.trim();
        val = this.replaceEntitiesValue(val, tagName, this.readonlyMatcher);
        processedVals[i] = val;
        rawAttrsForMatcher[attrName] = val;
        hasRawAttrs = true;
      }
    }
    if (hasRawAttrs && typeof jPath === "object" && jPath.updateCurrent) {
      jPath.updateCurrent(rawAttrsForMatcher);
    }
    const jPathStr = options.jPath ? jPath.toString() : this.readonlyMatcher;
    let hasAttrs = false;
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      if (this.ignoreAttributesFn(attrName, jPathStr)) continue;
      let aName = options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (options.transformAttributeName) {
          aName = options.transformAttributeName(aName);
        }
        aName = sanitizeName(aName, options);
        if (matches[i][4] !== void 0) {
          const oldVal = processedVals[i];
          const newVal = options.attributeValueProcessor(attrName, oldVal, jPathStr);
          if (newVal === null || newVal === void 0) {
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            attrs[aName] = newVal;
          } else {
            attrs[aName] = parseValue3(oldVal, options.parseAttributeValue, options.numberParseOptions);
          }
          hasAttrs = true;
        } else if (options.allowBooleanAttributes) {
          attrs[aName] = true;
          hasAttrs = true;
        }
      }
    }
    if (!hasAttrs) return;
    if (options.attributesGroupName && !options.preserveOrder) {
      const attrCollection = {};
      attrCollection[options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}
var parseXml = function(xmlData) {
  xmlData = xmlData.replace(/\r\n?/g, "\n");
  const xmlObj = new XmlNode("!xml");
  let currentNode = xmlObj;
  let textData = "";
  this.matcher.reset();
  this.entityDecoder.reset();
  this.entityExpansionCount = 0;
  this.currentExpandedLength = 0;
  this.doctypefound = false;
  const options = this.options;
  const docTypeReader = new DocTypeReader(options.processEntities);
  const xmlLen = xmlData.length;
  for (let i = 0; i < xmlLen; i++) {
    const ch = xmlData[i];
    if (ch === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
        let tagName = xmlData.substring(i + 2, closeIndex).trim();
        if (options.removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
          }
        }
        tagName = transformTagName(options.transformTagName, tagName, "", options).tagName;
        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        }
        const lastTagName = this.matcher.getCurrentTag();
        if (tagName && options.unpairedTagsSet.has(tagName)) {
          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
        }
        if (lastTagName && options.unpairedTagsSet.has(lastTagName)) {
          this.matcher.pop();
          this.tagsNodeStack.pop();
        }
        this.matcher.pop();
        this.isCurrentNodeStopNode = false;
        currentNode = this.tagsNodeStack.pop() || xmlObj;
        if (options.captureMetaData && currentNode) {
          currentNode.addEndIndex(closeIndex + 1);
        }
        textData = "";
        i = closeIndex;
      } else if (c1 === 63) {
        let tagData = readTagExp(xmlData, i, false, "?>");
        if (!tagData) throw new Error("Pi Tag is not closed.");
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        const attsMap = this.buildAttributesMap(tagData.tagExp, this.matcher, tagData.tagName, true);
        if (attsMap) {
          const ver = attsMap[this.options.attributeNamePrefix + "version"];
          this.entityDecoder.setXmlVersion(Number(ver) || 1);
          docTypeReader.setXmlVersion(Number(ver) || 1);
        }
        if (options.ignoreDeclaration && tagData.tagName === "?xml" || options.ignorePiTags) {
        } else {
          const childNode = new XmlNode(tagData.tagName);
          childNode.add(options.textNodeName, "");
          if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent && options.ignoreAttributes !== true) {
            childNode[":@"] = attsMap;
          }
          this.addChild(currentNode, childNode, this.readonlyMatcher, i);
          if (options.captureMetaData) {
            currentNode.addEndIndex(tagData.closeIndex + 2);
          }
        }
        i = tagData.closeIndex + 1;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
        if (options.commentPropName) {
          const comment = xmlData.substring(i + 4, endIndex - 2);
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
          currentNode.add(options.commentPropName, [{ [options.textNodeName]: comment }]);
        }
        i = endIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 68) {
        if (this.doctypefound) throw new Error("Multiple DOCTYPE declarations found.");
        this.doctypefound = true;
        const result = docTypeReader.readDocType(xmlData, i);
        this.entityDecoder.addInputEntities(result.entities);
        i = result.i;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9, closeIndex);
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        let val = this.parseTextData(tagExp, currentNode.tagname, this.readonlyMatcher, true, false, true, true);
        if (val == void 0) val = "";
        if (options.cdataPropName) {
          currentNode.add(options.cdataPropName, [{ [options.textNodeName]: tagExp }]);
        } else {
          currentNode.add(options.textNodeName, val);
        }
        i = closeIndex + 2;
      } else {
        let result = readTagExp(xmlData, i, options.removeNSPrefix);
        if (!result) {
          const context = xmlData.substring(Math.max(0, i - 50), Math.min(xmlLen, i + 50));
          throw new Error(`readTagExp returned undefined at position ${i}. Context: "${context}"`);
        }
        let tagName = result.tagName;
        const rawTagName = result.rawTagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;
        ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
        if (options.strictReservedNames && (tagName === options.commentPropName || tagName === options.cdataPropName || tagName === options.textNodeName || tagName === options.attributesGroupName)) {
          throw new Error(`Invalid tag name: ${tagName}`);
        }
        if (currentNode && textData) {
          if (currentNode.tagname !== "!xml") {
            textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher, false);
          }
        }
        const lastTag = currentNode;
        if (lastTag && options.unpairedTagsSet.has(lastTag.tagname)) {
          currentNode = this.tagsNodeStack.pop();
          this.matcher.pop();
        }
        let isSelfClosing = false;
        if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
          isSelfClosing = true;
          if (tagName[tagName.length - 1] === "/") {
            tagName = tagName.substr(0, tagName.length - 1);
            tagExp = tagName;
          } else {
            tagExp = tagExp.substr(0, tagExp.length - 1);
          }
          attrExpPresent = tagName !== tagExp;
        }
        let prefixedAttrs = null;
        let rawAttrs = {};
        let namespace = void 0;
        namespace = extractNamespace(rawTagName);
        if (tagName !== xmlObj.tagname) {
          this.matcher.push(tagName, {}, namespace);
        }
        if (tagName !== tagExp && attrExpPresent) {
          prefixedAttrs = this.buildAttributesMap(tagExp, this.matcher, tagName);
          if (prefixedAttrs) {
            rawAttrs = extractRawAttributes(prefixedAttrs, options);
          }
        }
        if (tagName !== xmlObj.tagname) {
          this.isCurrentNodeStopNode = this.isItStopNode();
        }
        const startIndex = i;
        if (this.isCurrentNodeStopNode) {
          let tagContent = "";
          if (isSelfClosing) {
            i = result.closeIndex;
          } else if (options.unpairedTagsSet.has(tagName)) {
            i = result.closeIndex;
          } else {
            const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
            if (!result2) throw new Error(`Unexpected end of ${rawTagName}`);
            i = result2.i;
            tagContent = result2.tagContent;
          }
          const childNode = new XmlNode(tagName);
          if (prefixedAttrs) {
            childNode[":@"] = prefixedAttrs;
          }
          childNode.add(options.textNodeName, tagContent);
          this.matcher.pop();
          this.isCurrentNodeStopNode = false;
          this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
          if (options.captureMetaData) {
            currentNode.addEndIndex(i + 1);
          }
        } else {
          if (isSelfClosing) {
            ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            if (options.captureMetaData) {
              currentNode.addEndIndex(closeIndex + 1);
            }
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
          } else if (options.unpairedTagsSet.has(tagName)) {
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            if (options.captureMetaData) {
              currentNode.addEndIndex(result.closeIndex + 1);
            }
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
            i = result.closeIndex;
            continue;
          } else {
            const childNode = new XmlNode(tagName);
            if (this.tagsNodeStack.length > options.maxNestedTags) {
              throw new Error("Maximum nested tags exceeded");
            }
            this.tagsNodeStack.push(currentNode);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      }
    } else {
      textData += xmlData[i];
    }
  }
  return xmlObj.child;
};
function addChild(currentNode, childNode, matcher, startIndex) {
  if (!this.options.captureMetaData) startIndex = void 0;
  const jPathOrMatcher = this.options.jPath ? matcher.toString() : matcher;
  const result = this.options.updateTag(childNode.tagname, jPathOrMatcher, childNode[":@"]);
  if (result === false) {
  } else if (typeof result === "string") {
    childNode.tagname = result;
    currentNode.addChild(childNode, startIndex);
  } else {
    currentNode.addChild(childNode, startIndex);
  }
}
function replaceEntitiesValue(val, tagName, jPath) {
  const entityConfig = this.options.processEntities;
  if (!entityConfig || !entityConfig.enabled) {
    return val;
  }
  if (entityConfig.allowedTags) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    const allowed = Array.isArray(entityConfig.allowedTags) ? entityConfig.allowedTags.includes(tagName) : entityConfig.allowedTags(tagName, jPathOrMatcher);
    if (!allowed) {
      return val;
    }
  }
  if (entityConfig.tagFilter) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    if (!entityConfig.tagFilter(tagName, jPathOrMatcher)) {
      return val;
    }
  }
  return this.entityDecoder.decode(val);
}
function saveTextToParentTag(textData, parentNode, matcher, isLeafNode) {
  if (textData) {
    if (isLeafNode === void 0) isLeafNode = parentNode.child.length === 0;
    textData = this.parseTextData(
      textData,
      parentNode.tagname,
      matcher,
      false,
      parentNode[":@"] ? Object.keys(parentNode[":@"]).length !== 0 : false,
      isLeafNode
    );
    if (textData !== void 0 && textData !== "")
      parentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}
function isItStopNode() {
  if (this.stopNodeExpressionsSet.size === 0) return false;
  return this.matcher.matchesAny(this.stopNodeExpressionsSet);
}
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
  let attrBoundary = 0;
  const len = xmlData.length;
  const closeCode0 = closingChar.charCodeAt(0);
  const closeCode1 = closingChar.length > 1 ? closingChar.charCodeAt(1) : -1;
  let result = "";
  let segmentStart = i;
  for (let index = i; index < len; index++) {
    const code = xmlData.charCodeAt(index);
    if (attrBoundary) {
      if (code === attrBoundary) attrBoundary = 0;
    } else if (code === 34 || code === 39) {
      attrBoundary = code;
    } else if (code === closeCode0) {
      if (closeCode1 !== -1) {
        if (xmlData.charCodeAt(index + 1) === closeCode1) {
          result += xmlData.substring(segmentStart, index);
          return { data: result, index };
        }
      } else {
        result += xmlData.substring(segmentStart, index);
        return { data: result, index };
      }
    } else if (code === 9 && !attrBoundary) {
      result += xmlData.substring(segmentStart, index) + " ";
      segmentStart = index + 1;
    }
  }
}
function findClosingIndex(xmlData, str, i, errMsg) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg);
  } else {
    return closingIndex + str.length - 1;
  }
}
function findClosingChar(xmlData, char, i, errMsg) {
  const closingIndex = xmlData.indexOf(char, i);
  if (closingIndex === -1) throw new Error(errMsg);
  return closingIndex;
}
function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result) return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {
    tagName = tagExp.substring(0, separatorIndex);
    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
  }
  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(":");
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }
  return {
    tagName,
    tagExp,
    closeIndex,
    attrExpPresent,
    rawTagName
  };
}
function readStopNodeData(xmlData, tagName, i) {
  const startIndex = i;
  let openTagCount = 1;
  const xmllen = xmlData.length;
  for (; i < xmllen; i++) {
    if (xmlData[i] === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingChar(xmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: xmlData.substring(startIndex, i),
              i: closeIndex
            };
          }
        }
        i = closeIndex;
      } else if (c1 === 63) {
        const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
        i = closeIndex;
      } else {
        const tagData = readTagExp(xmlData, i, false);
        if (tagData) {
          const openTagName = tagData && tagData.tagName;
          if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
            openTagCount++;
          }
          i = tagData.closeIndex;
        }
      }
    }
  }
}
function parseValue3(val, shouldParse, options) {
  if (shouldParse && typeof val === "string") {
    const newval = val.trim();
    if (newval === "true") return true;
    else if (newval === "false") return false;
    else return toNumber(val, options);
  } else {
    if (isExist(val)) {
      return val;
    } else {
      return "";
    }
  }
}
function transformTagName(fn, tagName, tagExp, options) {
  if (fn) {
    const newTagName = fn(tagName);
    if (tagExp === tagName) {
      tagExp = newTagName;
    }
    tagName = newTagName;
  }
  tagName = sanitizeName(tagName, options);
  return { tagName, tagExp };
}
function sanitizeName(name, options) {
  if (criticalProperties.includes(name)) {
    throw new Error(`[SECURITY] Invalid name: "${name}" is a reserved JavaScript keyword that could cause prototype pollution`);
  } else if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return options.onDangerousProperty(name);
  }
  return name;
}

// node_modules/fast-xml-parser/src/xmlparser/node2json.js
var METADATA_SYMBOL2 = XmlNode.getMetaDataSymbol();
function stripAttributePrefix(attrs, prefix) {
  if (!attrs || typeof attrs !== "object") return {};
  if (!prefix) return attrs;
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(prefix)) {
      const rawName = key.substring(prefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function prettify(node, options, matcher, readonlyMatcher) {
  return compress(node, options, matcher, readonlyMatcher);
}
function compress(arr, options, matcher, readonlyMatcher) {
  let text;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    if (property !== void 0 && property !== options.textNodeName) {
      const rawAttrs = stripAttributePrefix(
        tagObj[":@"] || {},
        options.attributeNamePrefix
      );
      matcher.push(property, rawAttrs);
    }
    if (property === options.textNodeName) {
      if (text === void 0) text = tagObj[property];
      else text += "" + tagObj[property];
    } else if (property === void 0) {
      continue;
    } else if (tagObj[property]) {
      let val = compress(tagObj[property], options, matcher, readonlyMatcher);
      const isLeaf = isLeafTag(val, options);
      if (Object.keys(val).length === 0 && options.alwaysCreateTextNode) {
        val[options.textNodeName] = "";
      }
      if (tagObj[":@"]) {
        assignAttributes(val, tagObj[":@"], readonlyMatcher, options);
      } else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
        val = val[options.textNodeName];
      } else if (Object.keys(val).length === 0) {
        if (options.alwaysCreateTextNode) val[options.textNodeName] = "";
        else val = "";
      }
      if (tagObj[METADATA_SYMBOL2] !== void 0 && typeof val === "object" && val !== null) {
        val[METADATA_SYMBOL2] = tagObj[METADATA_SYMBOL2];
      }
      if (compressedObj[property] !== void 0 && Object.prototype.hasOwnProperty.call(compressedObj, property)) {
        if (!Array.isArray(compressedObj[property])) {
          compressedObj[property] = [compressedObj[property]];
        }
        compressedObj[property].push(val);
      } else {
        const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() : readonlyMatcher;
        if (options.isArray(property, jPathOrMatcher, isLeaf)) {
          compressedObj[property] = [val];
        } else {
          compressedObj[property] = val;
        }
      }
      if (property !== void 0 && property !== options.textNodeName) {
        matcher.pop();
      }
    }
  }
  if (typeof text === "string") {
    if (text.length > 0) compressedObj[options.textNodeName] = text;
  } else if (text !== void 0) compressedObj[options.textNodeName] = text;
  return compressedObj;
}
function propName(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== ":@") return key;
  }
}
function assignAttributes(obj, attrMap, readonlyMatcher, options) {
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      const rawAttrName = atrrName.startsWith(options.attributeNamePrefix) ? atrrName.substring(options.attributeNamePrefix.length) : atrrName;
      const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() + "." + rawAttrName : readonlyMatcher;
      if (options.isArray(atrrName, jPathOrMatcher, true, true)) {
        obj[atrrName] = [attrMap[atrrName]];
      } else {
        obj[atrrName] = attrMap[atrrName];
      }
    }
  }
}
function isLeafTag(obj, options) {
  const { textNodeName } = options;
  const propCount = Object.keys(obj).length;
  if (propCount === 0) {
    return true;
  }
  if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
    return true;
  }
  return false;
}

// node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var XMLParser = class {
  constructor(options) {
    this.externalEntities = {};
    this.options = buildOptions(options);
  }
  /**
   * Parse XML dats to JS object 
   * @param {string|Uint8Array} xmlData 
   * @param {boolean|Object} validationOption 
   */
  parse(xmlData, validationOption) {
    if (typeof xmlData !== "string" && xmlData.toString) {
      xmlData = xmlData.toString();
    } else if (typeof xmlData !== "string") {
      throw new Error("XML data is accepted in String or Bytes[] form.");
    }
    if (validationOption) {
      if (validationOption === true) validationOption = {};
      const result = validate(xmlData, validationOption);
      if (result !== true) {
        throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
      }
    }
    const orderedObjParser = new OrderedObjParser(this.options, this.externalEntities);
    const orderedResult = orderedObjParser.parseXml(xmlData);
    if (this.options.preserveOrder || orderedResult === void 0) return orderedResult;
    else return prettify(orderedResult, this.options, orderedObjParser.matcher, orderedObjParser.readonlyMatcher);
  }
  /**
   * Add Entity which is not by default supported by this library
   * @param {string} key 
   * @param {string} value 
   */
  addEntity(key, value) {
    if (value.indexOf("&") !== -1) {
      throw new Error("Entity value can't have '&'");
    } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    } else if (value === "&") {
      throw new Error("An entity with value '&' is not permitted");
    } else {
      this.externalEntities[key] = value;
    }
  }
  /**
   * Returns a Symbol that can be used to access the metadata
   * property on a node.
   * 
   * If Symbol is not available in the environment, an ordinary property is used
   * and the name of the property is here returned.
   * 
   * The XMLMetaData property is only present when `captureMetaData`
   * is true in the options.
   */
  static getMetaDataSymbol() {
    return XmlNode.getMetaDataSymbol();
  }
};

// node_modules/data-explorer-core/dist/datamodel/parser/XmlReader.js
var ATTRIBUTE_PREFIX = "@_";
var TEXT_KEY = "#text";
var SHAPE = {
  ignoreAttributes: false,
  attributeNamePrefix: ATTRIBUTE_PREFIX,
  textNodeName: TEXT_KEY
};
function dropLayoutWhitespace(_tagName, value, _jPath, _hasAttributes, isLeafNode) {
  return !isLeafNode && value.trim() === "" ? "" : value;
}
var dictionaryParser = new XMLParser({
  ...SHAPE,
  isArray: (name) => name === "Object" || name === "P" || name === "Element" || name === "Field",
  trimValues: false,
  tagValueProcessor: dropLayoutWhitespace
});
var defaultParser = new XMLParser(SHAPE);
function readModelXml(text) {
  return defaultParser.parse(text);
}
function readProjectXml(text) {
  return defaultParser.parse(text);
}

// node_modules/data-explorer-core/dist/datamodel/parser/SlddParts.js
var DATA_PART = "data/chunk0";
var DATA_PART_XML = `${DATA_PART}.xml`;
var TEXT_PARTS = "__MW_TEXT_PARTS__";
var DATA_PART_KEY = `__MW_TEXT_PART__/${DATA_PART}`;
var TEXT_CONTENT = "__MW_TEXT_content";

// node_modules/data-explorer-core/dist/datamodel/parser/SlddContent.js
function slddChunkContent(json) {
  const parts = json[TEXT_PARTS];
  const chunk = parts?.[DATA_PART_KEY];
  return chunk?.[TEXT_CONTENT] ?? null;
}
function normalizeRefNames(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const names = [];
  for (const ref of raw) {
    const name = typeof ref === "string" ? ref : ref && typeof ref === "object" ? ref.file : void 0;
    if (typeof name === "string" && name !== "") {
      names.push(name);
    }
  }
  return names;
}

// node_modules/data-explorer-core/dist/datamodel/node/container/SlddNode.js
var SECTION_DEFS = [
  { key: "design", label: "Design Data", icon: "databaseFolderDesign" },
  { key: "arch", label: "Architectural Data", icon: "databaseFolderArchitecture" },
  { key: "config", label: "Configurations", icon: "databaseFolderConfiguration" },
  { key: "other", label: "Other Data", icon: "databaseFolder" }
];
var SlddNode = class _SlddNode extends ContainerNode {
  constructor(name) {
    super(name, null);
    this.coreProperties = null;
    this.dictionaryReferences = [];
    this.allowAccessBWS = false;
    this.dirty = false;
    this.sourceFormat = "json";
    this.rawXml = null;
    this._zipMetadata = null;
    this._dataSourceAttrs = null;
    this.systemComposer = null;
    SECTION_DEFS.forEach((def) => {
      this.addChild(new SectionNode(def.key, this, def.label, def.icon));
    });
  }
  get displayName() {
    return this.dirty ? this.name + " *" : this.name;
  }
  get icon() {
    return this.sourceFormat === "xml" ? "simulink_server" : "simulink_database";
  }
  get FileFormat() {
    return this.sourceFormat === "xml" ? "compressed-binary" : "uncompressed-text";
  }
  get Release() {
    return this.coreProperties && this.coreProperties.release || "";
  }
  get NumberOfEntries() {
    let count = 0;
    this.children.forEach((section) => {
      count += section.children.length;
    });
    return count;
  }
  getProperties() {
    return [PropName, PropRelease, PropFileFormat, PropNumberOfEntries];
  }
  getPILayout() {
    return [
      { group: "General", items: [PropName, PropRelease, PropFileFormat, PropNumberOfEntries] }
    ];
  }
  getSection(key) {
    return this.children.find((c) => c.name === key) || null;
  }
  addEntry(className, entryName, sectionKey) {
    const section = this.getSection(sectionKey);
    if (!section) {
      return null;
    }
    return section.addEntry(className, entryName);
  }
  /**
   * Build a dictionary tree out of dictionary content.
   *
   * This is the whole reader for an uncompressed-text `.sldd`: there is no parser
   * between the bytes and here, because `ingest` calls `JSON.parse` and hands the
   * result straight over. So this method is where a textual dictionary's diagnostics
   * have to be raised, and `warnings` — the same optional sink `parseBinarySldd`
   * takes, appended to rather than replaced — is how they get out. For a binary
   * dictionary the caller passes the array the parser already filled in, so one file
   * reports through one list no matter which flavour it arrived in.
   */
  static parse(json, filename, warnings) {
    const node = new _SlddNode(filename);
    node.coreProperties = json.__MW_TEXT_COREPROPERTIES__ || null;
    if (json.__rawXml) {
      node.sourceFormat = "xml";
      node.rawXml = json.__rawXml;
      node._zipMetadata = json.__zipMetadata || null;
      node._dataSourceAttrs = json.__dataSourceAttrs || null;
    }
    const parts = json[TEXT_PARTS];
    const content = slddChunkContent(json);
    node.systemComposer = json.__scCatalog ?? _SlddNode._parseSystemComposer(parts);
    if (!content) {
      warnings?.push({
        code: "source-empty",
        message: `"${filename}" holds no dictionary content part, so it reads as empty. It may not be a data dictionary, or it may not have been written completely.`
      });
    } else {
      node.dictionaryReferences = content["Dictionary References"] || [];
      node.allowAccessBWS = content.AllowAccessBWS || false;
      const entries = content.entries || [];
      entries.forEach((entry) => {
        const sectionKey = _SlddNode.getSectionKey(entry);
        const section = node.getSection(sectionKey);
        if (section) {
          section.parseEntry(entry, node.systemComposer);
        }
      });
    }
    return node;
  }
  // Extract the interface and modeled-data-type classifications from the
  // systemcomposer interface dictionary part, if present.
  static _parseSystemComposer(parts) {
    const part = parts && parts[`__MW_TEXT_PART__/${SC_PART}`];
    const content = part && part[TEXT_CONTENT];
    const entries = content && content.entries;
    if (!entries) {
      return null;
    }
    const interfaces = {};
    const modeledDataTypes = {};
    const readName2 = (item) => {
      const c = item.content || {};
      return c.p_Name || "";
    };
    entries.forEach((entry) => {
      const entryContent = entry.content || {};
      const catalog = entryContent.p_PortInterfaceCatalog;
      const catalogContent = catalog && catalog.content;
      const ifaceList = catalogContent && catalogContent.p_Interfaces;
      if (ifaceList) {
        ifaceList.forEach((iface) => {
          const name = readName2(iface);
          if (name) {
            interfaces[name] = iface.type || "";
          }
        });
      }
      const modeled = entryContent.p_ModeledDataTypes;
      if (modeled) {
        modeled.forEach((dt) => {
          const name = readName2(dt);
          if (name) {
            modeledDataTypes[name] = dt.type || "";
          }
        });
      }
    });
    return { interfaces, modeledDataTypes };
  }
  static getSectionKey(entry) {
    const meta = entry.metadata || {};
    return getSectionKey(meta);
  }
  serialize() {
    return this.serializeJson();
  }
  serializeJson() {
    const entries = [];
    this.children.forEach((section) => {
      section.children.forEach((entryNode) => {
        entries.push(entryNode.serialize());
      });
    });
    return {
      __MW_TEXT_COREPROPERTIES__: this.coreProperties,
      [TEXT_PARTS]: {
        [DATA_PART_KEY]: {
          [TEXT_CONTENT]: {
            entries,
            "Dictionary References": this.dictionaryReferences,
            AllowAccessBWS: this.allowAccessBWS
          }
        }
      }
    };
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropBlockPath.js
var PropBlockPath = class {
  static {
    this.key = "BlockPath";
  }
  static {
    this.displayName = "Block Path";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = null;
  }
  static readValue(node) {
    return node.blockPath || "";
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/blockIdentity.js
function blockKey(name, sid) {
  return sid !== "" ? sid : name;
}
function blockLabel(name, sid) {
  if (name !== "") {
    return name;
  }
  return sid !== "" ? `<SID: ${sid}>` : "";
}
function joinBlockPath(parentPath, label) {
  const segment = label.replace(/\//g, "//");
  return parentPath === "" ? segment : parentPath + "/" + segment;
}
function isInsideBlockPath(ancestor, path) {
  if (ancestor === "") {
    return true;
  }
  if (path === ancestor) {
    return true;
  }
  if (!path.startsWith(ancestor)) {
    return false;
  }
  let slashes = 0;
  while (path[ancestor.length + slashes] === "/") {
    slashes++;
  }
  return slashes % 2 === 1;
}

// node_modules/data-explorer-core/dist/datamodel/node/data/ModelBlockNode.js
var ModelBlockNode = class extends BaseNode {
  constructor(name, parent, blockType, paramUsages, modelSrcId, paramSourceId, sid = "", systemPath = "") {
    super(name, parent);
    this.blockType = blockType;
    this.paramUsages = paramUsages;
    this.modelSrcId = modelSrcId;
    this.paramSourceId = paramSourceId;
    this.sid = sid;
    this.systemPath = systemPath;
  }
  /**
   * `…/blocks/65` — the SID, not the name.
   *
   * The one place a block's id is formed, and the reason blockIdentity exists: a name
   * is unique per SYSTEM, so `f14.slx` alone has four blocks named `Gain` and the
   * inherited id gave all four `f14.slx/blocks/Gain`. A node id is what findNodeById
   * resolves, what a row is keyed by and what a selection is remembered as, so four
   * blocks sharing one was four blocks the host could not tell apart — and a name that
   * is BLANK (see blockLabel) made the id `f14.slx/blocks/` with nothing after the
   * slash at all.
   *
   * Falls back to the name for a file with no SIDs, which is the id those files always
   * had. A rename cannot change this id, which is the other half of what a SID is for.
   */
  get id() {
    const key = blockKey(this.name, this.sid);
    return this.parent ? this.parent.id + "/" + key : key;
  }
  get isEntry() {
    return true;
  }
  get icon() {
    return "block";
  }
  // `<SID: 65>` for a block whose label the user cleared — see blockLabel. Every
  // surface that shows a block goes through this or through toRow below, so there is
  // one answer to "what does this block read as".
  get displayName() {
    return blockLabel(this.name, this.sid);
  }
  get displayValue() {
    return this.blockType;
  }
  /**
   * WHERE this block is — `Controller/Gain`, and just `Gain` for one in the root system.
   *
   * Read by PropBlockPath (which ModelReferenceNode already uses, for the same fact about
   * a different node), so the Property Inspector answers the question a row of same-named
   * blocks raises. Model-relative and escaped by joinBlockPath — see blockIdentity.
   */
  get blockPath() {
    return joinBlockPath(this.systemPath, this.displayName);
  }
  get className() {
    return this.paramUsages.map((u) => `${u.property}=${u.value}`).join(", ");
  }
  get nameEditable() {
    return false;
  }
  get valueEditable() {
    return false;
  }
  // Builds its row from scratch rather than through super, so it shares its own — see
  // RowCellPool. A model's block list is where the repetition is worst: every block of the
  // same type spells the same Value, and a model with one parameterized gain per subsystem
  // spells the same DataType.
  toRow(pool) {
    const paramText = this.paramUsages.map((u) => `${u.property}=${u.value}`).join(", ");
    const firstParam = this.paramUsages.length > 0 ? this.paramUsages[0].value : null;
    const paramLink = firstParam && this.paramSourceId ? `${firstParam}@${this.paramSourceId}` : void 0;
    const row = {
      ID: this.id,
      parent: null,
      Status: "",
      Name: { label: this.displayName, iconId: this.icon, disabled: false, editable: false, element: false },
      Value: this.blockType,
      DataType: paramLink ? { text: paramText, linkTarget: paramLink } : paramText,
      _valueEditable: false,
      _graphTarget: this.modelSrcId,
      // How a caller asks the usage index about THIS block (UsageIndex.paramsOf) and
      // what a link back to it carries (NodeUsage.linkTarget) — the SID, because the
      // label above is not unique and may be a stand-in. A host joining on the label
      // would put one block's parameters on another block's row, which is the merge
      // blockIdentity exists to undo.
      _blockKey: blockKey(this.name, this.sid),
      // Where the block is, for a host that wants to qualify a row a name cannot
      // distinguish: the enclosing systems, and the whole path. Two fields rather than
      // one because they answer differently — `Gain` in a cell reading
      // `Gain (Controller)` needs the parent alone, and the full path is the address —
      // and because joining them is an escaping rule (blockIdentity.joinBlockPath) that
      // no consumer should have to repeat.
      _systemPath: this.systemPath,
      _blockPath: this.blockPath
    };
    return pool ? pool.share(row) : row;
  }
  getProperties() {
    return [PropName, PropBlockPath];
  }
  getPILayout() {
    return [{ group: "General", items: [PropName, PropBlockPath] }];
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropStatus.js
var PropStatus = class {
  static {
    this.key = "Status";
  }
  static {
    this.displayName = "Status";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = null;
  }
  static readValue(node) {
    return node.resolved ? "Loaded" : "Not Loaded";
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ModelReferenceNode.js
var ModelReferenceNode = class extends BaseNode {
  constructor(name, parent, blockPath) {
    super(name, parent);
    this.blockPath = blockPath;
    this.resolved = false;
  }
  get isEntry() {
    return true;
  }
  get icon() {
    return "modelReference";
  }
  get displayName() {
    return this.name;
  }
  get displayValue() {
    return this.blockPath;
  }
  get className() {
    return "Model Reference";
  }
  get nameEditable() {
    return false;
  }
  get valueEditable() {
    return false;
  }
  // Super without the pool, shared after the rewrite — see DataSourceNode.toRow.
  toRow(pool) {
    const row = super.toRow();
    if (row) {
      row.Value = { text: row.Value, linkTarget: this.name };
    }
    return row && pool ? pool.share(row) : row;
  }
  getProperties() {
    return [PropName, PropBlockPath, PropStatus];
  }
  getPILayout() {
    return [
      { group: "General", items: [PropName, PropBlockPath, PropStatus] }
    ];
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropPath.js
var PropPath = class {
  static {
    this.key = "Path";
  }
  static {
    this.displayName = "Path";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = null;
  }
  static readValue(node) {
    return node.fullPath || node.name;
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/fileKinds.js
function extOf(filename) {
  const dot = filename.lastIndexOf(".");
  return dot < 0 ? "" : filename.slice(dot).toLowerCase();
}
function basenameOf(text) {
  return text.split(/[\\/]/).pop() || text;
}
function refBasename(text) {
  return basenameOf(text).toLowerCase();
}
function modelNameOf(name) {
  const match = /^(.*)\.(slx|mdl)$/i.exec(name);
  return match ? match[1] : null;
}
function isModelFile(filename) {
  const ext = extOf(filename);
  return ext === ".slx" || ext === ".mdl";
}
function refModelExt(parentFilename) {
  return extOf(parentFilename) === ".mdl" ? ".mdl" : ".slx";
}
function isSlddFile(filename) {
  return extOf(filename) === ".sldd";
}
function isMatFile(filename) {
  return extOf(filename) === ".mat";
}
function projectNameOf(filename) {
  return filename.replace(/\.prj$/i, "");
}

// node_modules/data-explorer-core/dist/datamodel/node/data/DataSourceNode.js
var DataSourceNode = class extends BaseNode {
  constructor(name, parent, fullPath) {
    super(name, parent);
    this.fullPath = fullPath;
    this.resolved = false;
  }
  get isEntry() {
    return true;
  }
  /**
   * The one classification behind BOTH the icon and the class name.
   *
   * These were two independent chains of `endsWith`, which is two answers to one
   * question: a kind added to one and not the other shows a dictionary icon on a row
   * labelled 'MAT File'. They were also both case-SENSITIVE, while `refBasename` —
   * which is what actually RESOLVES this source against the workspace — is not. So a
   * model naming `Params.SLDD`, exactly as its author typed it, got a working link and a
   * MAT-file presentation, and no part of that looks like a bug from either side.
   * Deriving from `fileKinds` puts the case rule where the rest of this package keeps it.
   */
  get presentation() {
    if (isSlddFile(this.name)) {
      return { icon: "simulinkDataDictionary_FT", className: "Data Dictionary" };
    }
    if (isModelFile(this.name)) {
      return { icon: "simulinkModel_FT", className: "Simulink Model" };
    }
    return { icon: "matlabWorkspaceFile", className: "MAT File" };
  }
  get icon() {
    return this.presentation.icon;
  }
  get displayName() {
    return this.name;
  }
  get displayValue() {
    return this.fullPath;
  }
  get className() {
    return this.presentation.className;
  }
  get nameEditable() {
    return false;
  }
  get valueEditable() {
    return false;
  }
  // Deliberately calls super WITHOUT the pool and shares at the end instead: it replaces
  // the Value cell super built, so pooling before the rewrite would index a cell that
  // does not survive the call and leave the one that does unpooled.
  toRow(pool) {
    const row = super.toRow();
    if (row) {
      row.Value = { text: row.Value, linkTarget: this.name };
    }
    return row && pool ? pool.share(row) : row;
  }
  getProperties() {
    return [PropName, PropPath, PropStatus];
  }
  getPILayout() {
    return [
      { group: "General", items: [PropName, PropPath, PropStatus] }
    ];
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/container/ModelSectionNode.js
var ModelSectionNode = class extends ContainerNode {
  constructor(name, parent, label, iconId) {
    super(name, parent);
    this.label = label;
    this.iconId = iconId;
  }
  get icon() {
    return this.iconId;
  }
  get displayName() {
    return this.label;
  }
  get tableColumnConfig() {
    switch (this.name) {
      case "blocks":
        return { columns: ["Name", "Value", "DataType"], labels: { Value: "Block Type", DataType: "Uses" } };
      case "workspace":
        return { columns: ["Name", "Value", "DataType", "UsedBy"] };
      case "config":
        return { columns: ["Name", "Description"] };
      default:
        return { columns: ["Name", "Value", "DataType", "UsedBy"] };
    }
  }
  addWorkspaceEntry(entry) {
    const node = MatlabVariableNode.parseMatVariable(entry, entry.name, this);
    this.addChild(node);
    return node;
  }
  addConfigSetEntry(cfg) {
    const objectClass = cfg.objectClass === "Simulink.ConfigSetRef" ? "Simulink.ConfigSetRef" : "Simulink.ConfigSet";
    const props = { Name: cfg.name };
    if (objectClass === "Simulink.ConfigSetRef" && cfg.sourceName) {
      props.SourceName = cfg.sourceName;
    }
    const rawVal = {
      _array_class: objectClass,
      _array_type: "MATLABArray",
      _dimensions: [1, 1],
      _mw_element_type: "MATLABArray",
      _elements: [{ _properties: props }]
    };
    const node = objectClass === "Simulink.ConfigSetRef" ? ConfigSetRefNode.parse(rawVal, cfg.name, this) : ConfigSetNode.parse(rawVal, cfg.name, this);
    node.active = cfg.active;
    this.addChild(node);
    return node;
  }
  // A model file names its references WITHOUT an extension, but the entry has to be
  // a filename: it doubles as the link target used to jump to that model once it is
  // loaded. `defaultExt` is the parent model's own extension, because a reference is
  // far likelier to be the same generation of file as the model referencing it — a
  // legacy `.mdl` hierarchy is legacy throughout — and a `.mdl` model whose children
  // were all labelled `.slx` would link to nothing.
  //
  // `isModelFile` decides whether the name is already complete, rather than a regex
  // spelled here: that is the same question this package publishes an answer to, and a
  // second copy of it is a second opinion about whether `plant.MDL` needs completing —
  // which would produce `plant.MDL.slx`, a link to nothing.
  //
  // Required, with no `.slx` default: a default would be a THIRD answer to "which
  // extension" — one a caller that forgot the parent's would take silently. The guess
  // belongs to `fileKinds.refModelExt`, and the point of it living there is that every
  // caller makes it the same way. No caller ever took the default; omitting the argument
  // is now a compile error rather than a `.mdl` hierarchy labelled `.slx`.
  addReferenceEntry(ref, defaultExt) {
    const named = isModelFile(ref.modelName);
    const node = new ModelReferenceNode(named ? ref.modelName : ref.modelName + defaultExt, this, ref.blockPath);
    this.addChild(node);
    return node;
  }
  // `blockName` is the name the FILE records, blank included; `sid` is what the entry
  // is identified by; `systemPath` is where in the model it sits. See blockIdentity for
  // why those are three arguments and not one.
  addBlockEntry(blockName, blockType, paramUsages, modelSrcId, paramSourceId, sid = "", systemPath = "") {
    const node = new ModelBlockNode(blockName, this, blockType, paramUsages, modelSrcId, paramSourceId, sid, systemPath);
    this.addChild(node);
    return node;
  }
  addDataSourceEntry(path) {
    const node = new DataSourceNode(basenameOf(path), this, path);
    this.addChild(node);
    return node;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/mcosTypedNode.js
var GENERIC_KEYS = /* @__PURE__ */ new Set(["MatlabVariable", "MatlabStruct", "CustomObject"]);
function buildTypedNodeFromMcos(className, name, parent, properties, elements, dimensions, warnings) {
  if (!className || GENERIC_KEYS.has(className)) {
    return null;
  }
  const elems = elements && elements.length > 0 ? elements : [properties || {}];
  const dims = dimensions && dimensions.length >= 2 ? dimensions.slice() : elems.length > 1 ? [1, elems.length] : [1, 1];
  const isArray = elems.length > 1;
  const isKnown = !!getClass(className);
  const hasData = isArray || elems.some((e) => e && Object.keys(e).length > 0);
  if (!isKnown && !hasData) {
    return null;
  }
  const rawVal = {
    _array_class: className,
    _array_type: "MATLABArray",
    _dimensions: dims,
    _mw_element_type: "MATLABArray",
    _elements: elems.map((e) => ({ _properties: e || {} }))
  };
  try {
    return parseValue(rawVal, name, parent);
  } catch (err2) {
    warnings?.push({
      code: "part-unreadable",
      message: `the MATLAB object "${name}" was decoded but its ${className} view could not be built, so it is shown as an opaque variable without its property rows (${reasonOf(err2)})`,
      part: name
    });
    return null;
  }
}
function decodeMcosObjects(blobBytes, variables) {
  const opaque = variables.filter((v) => v.isOpaque && v.name);
  if (opaque.length === 0 || !blobBytes) {
    return null;
  }
  return decodeMcosBlob(blobBytes, opaque.map((v) => ({ name: v.name, className: v.className, rawBytes: v._rawBytes })));
}
function modelOpaqueMcosVariable(variable, decoded, parent, warnings) {
  if (variable.className === STRING_CLASS_NAME && decoded) {
    return MatlabVariableNode.createFromMcosDecoded(variable, decoded, parent);
  }
  const typed = buildTypedNodeFromMcos(variable.className, variable.name, parent, decoded?.properties, decoded?.elements, decoded?.dimensions, warnings);
  if (typed) {
    return typed;
  }
  if (decoded) {
    return MatlabVariableNode.createFromMcosDecoded(variable, decoded, parent);
  }
  return null;
}

// node_modules/data-explorer-core/dist/datamodel/node/container/ModelNode.js
var SECTION_DEFS2 = [
  { key: "blocks", label: "Model Elements", icon: "blocks" },
  { key: "workspace", label: "Model Workspace", icon: "databaseFolderWorkspace" },
  { key: "config", label: "Configurations", icon: "databaseFolderConfiguration" },
  { key: "references", label: "Model References", icon: "modelReference" },
  { key: "dataSources", label: "External Data", icon: "link_database" }
];
var ModelNode = class _ModelNode extends ContainerNode {
  constructor(name) {
    super(name, null);
    this.release = "";
    this.creator = "";
    this.lastModified = "";
    this.uuid = "";
    this.dataDictionary = null;
    this.rawContents = null;
    this.dirty = false;
    this.blockParamUsages = [];
    this.masks = [];
    this._zipEntries = null;
    this._workspaceVars = null;
    SECTION_DEFS2.forEach((def) => {
      this.addChild(new ModelSectionNode(def.key, this, def.label, def.icon));
    });
  }
  get tableColumnConfig() {
    return { columns: ["Name", "Value", "DataType", "UsedBy"], labels: { DataType: "Type", UsedBy: "Usage" } };
  }
  get displayName() {
    return this.name;
  }
  get readOnly() {
    return true;
  }
  // The format an out-of-process host is told this source is, since SourceDTO carries
  // this field and nothing else in the projection names the format. Three values rather
  // than one per extension, because a Simulink model on disk really comes in three
  // shapes and `.mdl` covers two of them: the classic single flat text file, and the
  // modern OPC package which is a zip of parts exactly as a `.slx` is. Derived, not
  // stored, for the reason ProjectNode gives: this cannot change once the file is read,
  // and a field could drift from the parse that set it.
  //
  // Read off the CONTENT first and the name only to separate the two package cases.
  // `_zipEntries` is non-null exactly when the file yielded OPC PARTS — a real zip's
  // entries for a `.slx`, or the parts decodeOpcTextPackage recovered from a modern
  // `.mdl`'s text framing, which MdlParser hands to the same parseModelParts — and null
  // only for the classic single flat text file. It is NOT "which parser ran": both
  // flavours of `.mdl` go through parseMdl. This is the same test `serialize()` below
  // already makes to decide whether it has an archive to summarize. A srcId with no
  // recognisable extension (an opaque host URI) therefore still answers 'slx' for a
  // package and 'mdl' for flat text rather than guessing from a name it lacks.
  //
  // One wrinkle, reported as what was READ rather than what the file was: a package
  // truncated before its first part survives falls through to the classic grammar
  // reader, which finds the compatibility stub a modern `.mdl` opens with, so this
  // answers 'mdl'. Nothing on the node distinguishes that case — both fields are null
  // on that path — and the `source-unreadable` warning the reader files is what tells a
  // host the file was more than the stub. Deriving a format from a warning would be
  // worse than understating one.
  // Note 'xml' is deliberately NOT used for the package cases even though the parts are
  // XML in older releases: that token means a compressed-binary dictionary elsewhere,
  // and a consumer switching on this field must not mistake a model for one.
  get sourceFormat() {
    if (!this._zipEntries) {
      return "mdl";
    }
    return extOf(this.name) === ".mdl" ? "mdl-package" : "slx";
  }
  get icon() {
    return "simulink";
  }
  get Release() {
    return this.release;
  }
  get NumberOfEntries() {
    let count = 0;
    this.children.forEach((section) => {
      count += section.children.length;
    });
    return count;
  }
  getProperties() {
    return [PropName, PropRelease];
  }
  getPILayout() {
    return [{ group: "General", items: [PropName, PropRelease] }];
  }
  getSection(key) {
    return this.children.find((c) => c.name === key) || null;
  }
  serialize() {
    if (!this._zipEntries) {
      return {
        model: this.name,
        release: this.release,
        uuid: this.uuid,
        dataDictionary: this.dataDictionary || "(none)",
        modelReferences: this.getSection("references").children.map((c) => c.name),
        externalDataSources: this.getSection("dataSources").children.map((c) => c.name),
        configSets: this.getSection("config").children.map((c) => c.name),
        workspace: "... (" + this.getSection("workspace").children.length + " entries)",
        archiveFiles: this.rawContents ? Object.keys(this.rawContents) : []
      };
    }
    const entries = Object.assign({}, this._zipEntries);
    if (this._workspaceVars) {
      const wsSection = this.getSection("workspace");
      for (const child of wsSection.children) {
        const varChild = child;
        if (varChild._var && varChild._var._modified) {
          const wsVar = this._workspaceVars.find((v) => v.name === child.name);
          if (wsVar) {
            wsVar.value = varChild._var.value;
            wsVar.dimensions = varChild._var.dimensions;
            wsVar._modified = true;
          }
        }
      }
    }
    return entries;
  }
  static fromParsed(parsed, filename) {
    const node = new _ModelNode(filename);
    node.release = parsed.release;
    node.creator = parsed.creator;
    node.lastModified = parsed.lastModified;
    node.uuid = parsed.uuid;
    node.dataDictionary = parsed.dataDictionary;
    node.rawContents = parsed.rawContents || null;
    node._zipEntries = parsed.zipEntries || null;
    node._workspaceVars = parsed.workspace;
    node.blockParamUsages = parsed.blockParamUsages || [];
    node.masks = parsed.masks || [];
    if (parsed.blockParamUsages && parsed.blockParamUsages.length > 0) {
      const blocksSection = node.getSection("blocks");
      const blockMap = /* @__PURE__ */ new Map();
      for (const usage of parsed.blockParamUsages) {
        const key = blockKey(usage.blockName, usage.sid ?? "");
        if (!blockMap.has(key)) {
          blockMap.set(key, {
            name: usage.blockName,
            type: usage.blockType,
            sid: usage.sid ?? "",
            systemPath: usage.systemPath ?? "",
            usages: []
          });
        }
        blockMap.get(key).usages.push({
          property: usage.paramProperty,
          value: usage.paramValue
        });
      }
      const paramSourceId = parsed.dataDictionary || null;
      for (const info of blockMap.values()) {
        blocksSection.addBlockEntry(info.name, info.type, info.usages, filename, paramSourceId, info.sid, info.systemPath);
      }
    }
    const wsSection = node.getSection("workspace");
    const wsVars = parsed.workspace;
    const trailingElements = wsVars._trailingElements;
    const mcosData = decodeMcosObjects(trailingElements?.[0], wsVars);
    for (const entry of wsVars) {
      if (entry.isOpaque) {
        const mcosNode = modelOpaqueMcosVariable(entry, mcosData?.get(entry.name), wsSection, parsed.warnings);
        if (mcosNode) {
          wsSection.addChild(mcosNode);
          continue;
        }
      }
      wsSection.addWorkspaceEntry(entry);
    }
    const cfgSection = node.getSection("config");
    for (const cfg of parsed.configSets) {
      cfgSection.addConfigSetEntry(cfg);
    }
    const refSection = node.getSection("references");
    const refExt = refModelExt(filename);
    for (const ref of parsed.modelReferences) {
      refSection.addReferenceEntry(ref, refExt);
    }
    const dsSection = node.getSection("dataSources");
    if (parsed.dataDictionary) {
      dsSection.addDataSourceEntry(parsed.dataDictionary);
    }
    for (const path of parsed.externalDataSources) {
      dsSection.addDataSourceEntry(path);
    }
    return node;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/container/MatNode.js
var MatNode = class _MatNode extends ContainerNode {
  constructor(name) {
    super(name, null);
    this.header = "";
    this.dirty = false;
    this._anonymousElements = [];
  }
  get displayName() {
    return this.name;
  }
  get readOnly() {
    return true;
  }
  // The format an out-of-process host is told this source is, since SourceDTO carries
  // this field and nothing else in the projection names the format. One value, unlike
  // ModelNode's three: a MAT-file has on-disk levels (4, 5, 7, 7.3) but only one of them
  // ever reaches this class — MatParser reads the Level-5 framing that `-v7` also uses,
  // and refuses `-v7.3` with a throw because it is HDF5, so no MatNode exists for one.
  // A level would therefore describe the reader's single supported case rather than
  // distinguish anything a consumer could act on. `header` keeps the file's own claim
  // for anyone who wants the detail. A getter, as ProjectNode's is: this cannot change
  // once the file is read.
  get sourceFormat() {
    return "mat";
  }
  get icon() {
    return "matlabWorkspaceFile";
  }
  get NumberOfEntries() {
    return this.children.length;
  }
  getProperties() {
    return [PropName];
  }
  getPILayout() {
    return [{ group: "General", items: [PropName] }];
  }
  getSection() {
    return null;
  }
  execAddEntry(_className, entryName) {
    const name = entryName || this._uniqueName("var");
    const node = MatlabVariableNode.createDefault(name, this);
    this.addChild(node);
    this.dirty = true;
    return {
      node,
      undo: () => {
        this.removeChild(node);
        this.dirty = true;
      },
      redo: () => {
        this.addChild(node);
        this.dirty = true;
      }
    };
  }
  _uniqueName(baseName) {
    const names = new Set(this.children.map((c) => c.name));
    if (!names.has(baseName)) {
      return baseName;
    }
    let i = 1;
    while (names.has(baseName + i)) {
      i++;
    }
    return baseName + i;
  }
  execRemoveEntry(node) {
    const index = this.children.indexOf(node);
    if (index < 0) {
      return null;
    }
    this.removeChild(node);
    this.dirty = true;
    return {
      undo: () => {
        this.addChild(node, index);
        this.dirty = true;
      },
      redo: () => {
        this.removeChild(node);
        this.dirty = true;
      }
    };
  }
  getVariables() {
    const variables = [];
    for (const child of this.children) {
      const v = child._var;
      if (v) {
        variables.push(v);
      }
    }
    for (const anon of this._anonymousElements) {
      variables.push(anon);
    }
    return variables;
  }
  // `warnings` is optional in the parameter type rather than required because a host
  // that hands over an older parse has none — the same reason addMatSourceParsed reads
  // `result.warnings` defensively. When it IS there it is the array addMatSource passes
  // to registerSource after this returns, so a degrade appended during construction
  // reaches the source node.
  static fromParsed(parsed, filename) {
    const node = new _MatNode(filename);
    node.header = parsed.header;
    const anonElement = parsed.variables.find((v) => v._anonymous);
    const mcosData = decodeMcosObjects(anonElement?._rawBytes, parsed.variables);
    for (const variable of parsed.variables) {
      if (variable._anonymous) {
        node._anonymousElements.push(variable);
        continue;
      }
      if (variable.isOpaque) {
        const mcosNode = modelOpaqueMcosVariable(variable, mcosData?.get(variable.name), node, parsed.warnings);
        if (mcosNode) {
          node.addChild(mcosNode);
          continue;
        }
      }
      const child = MatlabVariableNode.parseMatVariable(variable, variable.name, node);
      node.addChild(child);
    }
    return node;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropType.js
var PropType = class {
  static {
    this.key = "Type";
  }
  static {
    this.displayName = "Type";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = "Type";
  }
  static readValue(node) {
    const n = node;
    return n.projectItemType || n.className || "";
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropLocation.js
var PropLocation = class {
  static {
    this.key = "Location";
  }
  static {
    this.displayName = "Location";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = "Location";
  }
  static readValue(node) {
    return node.location || "";
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/prop/PropLabels.js
var PropLabels = class {
  static {
    this.key = "Labels";
  }
  static {
    this.displayName = "Labels";
  }
  static {
    this.editor = "label";
  }
  static {
    this.column = "Labels";
  }
  static readValue(node) {
    const labels = node.labels;
    return labels && labels.length > 0 ? labels.join(", ") : "";
  }
  static {
    this.format = formatText;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/data/ProjectItemNode.js
var ProjectItemNode = class extends BaseNode {
  constructor(name, parent, opts) {
    super(name, parent);
    this.projectItemType = opts.itemType;
    this.location = opts.location;
    this.labels = opts.labels || [];
  }
  get isEntry() {
    return true;
  }
  // The icon follows from the item TYPE alone (and, for a file, its extension) —
  // ProjectSectionNode is the only thing that builds these nodes and it sets no
  // icon per item, so there is deliberately no per-node override to consult.
  get icon() {
    const type = this.projectItemType;
    if (type === "Folder") {
      return "databaseFolder";
    }
    if (type === "Path Folder") {
      return "link_database";
    }
    if (type === "Label") {
      return "wsDefault";
    }
    if (type === "Reference") {
      return "modelReference";
    }
    if (isModelFile(this.name)) {
      return "simulinkModel_FT";
    }
    if (isSlddFile(this.name)) {
      return "simulinkDataDictionary_FT";
    }
    if (isMatFile(this.name)) {
      return "matlabWorkspaceFile";
    }
    return "wsDefault";
  }
  get displayName() {
    return this.name;
  }
  get displayValue() {
    return this.location;
  }
  get className() {
    return this.projectItemType;
  }
  get nameEditable() {
    return false;
  }
  get valueEditable() {
    return false;
  }
  getProperties() {
    return [PropName, PropType, PropLocation, PropLabels];
  }
  getPILayout() {
    return [
      { group: "General", items: [PropName, PropType, PropLocation, PropLabels] }
    ];
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/container/ProjectSectionNode.js
var ROOT_FOLDER_NAME = "(project root)";
var ProjectSectionNode = class extends ContainerNode {
  constructor(name, parent, label, iconId) {
    super(name, parent);
    this.label = label;
    this.iconId = iconId;
  }
  get icon() {
    return this.iconId;
  }
  get displayName() {
    return this.label;
  }
  get tableColumnConfig() {
    return { columns: ["Name", "Type", "Location", "Labels"] };
  }
  addFileEntry(file) {
    const name = file.path.split(/[/\\]/).pop() || file.path;
    const node = new ProjectItemNode(name, this, {
      itemType: file.isFolder ? "Folder" : "File",
      location: file.path,
      labels: file.labels
    });
    this.addChild(node);
    return node;
  }
  addPathEntry(folder) {
    const name = folder === "" ? ROOT_FOLDER_NAME : folder.split(/[/\\]/).filter((p) => p.length > 0).pop() || folder;
    const node = new ProjectItemNode(name, this, {
      itemType: "Path Folder",
      location: folder
    });
    this.addChild(node);
    return node;
  }
  addLabelEntry(label) {
    const node = new ProjectItemNode(label.name, this, {
      itemType: "Label",
      location: label.category
    });
    this.addChild(node);
    return node;
  }
  addReferenceEntry(ref) {
    const node = new ProjectItemNode(ref.name ?? ref.id, this, {
      itemType: "Reference",
      location: ref.id
    });
    this.addChild(node);
    return node;
  }
};

// node_modules/data-explorer-core/dist/datamodel/node/container/ProjectNode.js
var SECTION_DEFS3 = [
  { key: "files", label: "Project Files", icon: "databaseFolder" },
  { key: "path", label: "Project Path", icon: "link_database" },
  { key: "labels", label: "Labels", icon: "databaseFolder" },
  { key: "references", label: "References", icon: "modelReference" }
];
var ProjectNode = class _ProjectNode extends ContainerNode {
  constructor(name) {
    super(name, null);
    SECTION_DEFS3.forEach((def) => {
      this.addChild(new ProjectSectionNode(def.key, this, def.label, def.icon));
    });
  }
  get tableColumnConfig() {
    return { columns: ["Name", "Type", "Location", "Labels"] };
  }
  get displayName() {
    return this.name;
  }
  get readOnly() {
    return true;
  }
  // The format an out-of-process host is told this source is, since SourceDTO
  // carries this field and nothing else in the projection names the format. It is
  // the format rather than the encoding on purpose: SlddNode's `sourceFormat` is
  // 'json' or 'xml' because a .sldd really comes in two encodings and it keys its
  // own icon and FileFormat off which, whereas a .prj comes in exactly one — a zip
  // of XML documents — so 'xml' would say nothing here while handing a project the
  // token a dictionary uses for a different meaning. Anything later switching on
  // this field (a serializer choosing a writer, say) must not mistake a project for
  // an XML-flavoured dictionary. A getter, not a field: unlike a .sldd's, this
  // cannot change once the file is read.
  get sourceFormat() {
    return "prj";
  }
  get icon() {
    return "simulink_project";
  }
  get NumberOfEntries() {
    let count = 0;
    this.children.forEach((section) => {
      count += section.children.length;
    });
    return count;
  }
  getProperties() {
    return [PropName];
  }
  getPILayout() {
    return [{ group: "General", items: [PropName] }];
  }
  getSection(key) {
    return this.children.find((c) => c.name === key) || null;
  }
  static fromParsed(parsed, filename) {
    const node = new _ProjectNode(filename);
    const labelName = /* @__PURE__ */ new Map();
    for (const label of parsed.labels) {
      if (label.id) {
        labelName.set(label.id, label.name);
      }
    }
    const filesSection = node.getSection("files");
    for (const file of parsed.files) {
      const resolved = {
        ...file,
        labels: file.labels.map((id) => labelName.get(id) ?? id)
      };
      filesSection.addFileEntry(resolved);
    }
    const pathSection = node.getSection("path");
    for (const folder of parsed.pathFolders) {
      pathSection.addPathEntry(folder);
    }
    const labelsSection = node.getSection("labels");
    for (const label of parsed.labels) {
      labelsSection.addLabelEntry(label);
    }
    const refsSection = node.getSection("references");
    for (const ref of parsed.references) {
      refsSection.addReferenceEntry(ref);
    }
    return node;
  }
};

// node_modules/data-explorer-core/dist/datamodel/parser/enumBlockParams.js
var ENUM_BLOCK_PARAMS = {
  Abs: ["RndMeth"],
  AlgebraicConstraint: ["Constraint", "EquationFormat", "Solver"],
  ArithShift: ["BitShiftDirection", "BitShiftNumberSource", "DiagnosticForOORShift"],
  Assignment: ["DiagnosticForDimensions", "IndexMode", "OutputInitialize"],
  Backlash: ["InputProcessing"],
  BusCreator: ["DisplayOption"],
  CFunction: ["CustomCodeSettingLocation"],
  ComplexToMagnitudeAngle: ["ApproximationMethod", "Output"],
  ComplexToRealImag: ["Output"],
  Concatenate: ["Mode"],
  DataStoreMemory: ["DataLoggingNameMode", "ReadBeforeWriteMsg", "SignalType", "WriteAfterReadMsg", "WriteAfterWriteMsg"],
  DataStoreRead: ["IndexMode"],
  DataStoreWrite: ["IndexMode"],
  DataTypeConversion: ["ConvertRealWorld", "RndMeth"],
  DateTimeClock: ["DiagnosticForClockRollOver", "InitialDateTimeSource", "StorageDataType", "TimePoint", "TimeStandard"],
  DateTimeDataTypeConverter: ["StorageDataType", "TimePoint"],
  DateTimeTimeStandardConverter: ["TimeStandardConversion"],
  DateTimeToFormattedString: ["InputMode"],
  Delay: ["DelayLengthSource", "DiagnosticForDelayLength", "ExternalReset", "InitialConditionSource", "InputProcessing"],
  Demux: ["DisplayOption"],
  DescriptorStateSpace: ["DirectFeedthrough", "ParameterTunability"],
  DiscreteFilter: ["DenominatorSource", "ExternalReset", "FilterStructure", "InitialStatesSource", "InputProcessing", "NumeratorSource", "RndMeth"],
  DiscreteFir: ["CoefSource", "ExternalReset", "FilterStructure", "InputProcessing", "RndMeth"],
  DiscreteIntegrator: ["ExternalReset", "InitialConditionSetting", "InitialConditionSource", "IntegratorMethod", "RndMeth"],
  DiscretePulseGenerator: ["PulseType", "TimeSource"],
  DiscreteTransferFcn: ["DenominatorSource", "ExternalReset", "FilterStructure", "InitialStatesSource", "InputProcessing", "NumeratorSource", "RndMeth"],
  Display: ["Format"],
  DotProduct: ["RndMeth"],
  EnablePort: ["PropagateVarSize", "StatesWhenEnabling"],
  ExpandScalar: ["ElementValueSource"],
  FMU: ["FMUInputMapping", "FMUMode", "FMUOutputMapping", "FMUParamMapping"],
  Find: ["IndexMode", "IndexOutputFormat"],
  FirstOrderHold: ["OutputAlgorithm"],
  FloatExtractBits: ["OutputMode"],
  From: ["IconDisplay"],
  FromFile: ["ExtrapolationAfterLastDataPoint", "ExtrapolationBeforeFirstDataPoint", "InterpolationWithinTimeRange"],
  FromSpreadsheet: ["ExtrapolationAfterLastDataPoint", "ExtrapolationBeforeFirstDataPoint", "InterpolationWithinTimeRange", "OutputAfterLastPoint", "ReaderLibrary", "TreatFirstColumnAs"],
  FromWorkspace: ["OutputAfterFinalValue"],
  FunctionCallSplit: ["IconShape", "OutputPortLayout"],
  Gain: ["Multiplication", "RndMeth"],
  Goto: ["IconDisplay", "TagVisibility"],
  HitCross: ["HitCrossingDirection", "HitCrossingOutputType"],
  HitScheduler: ["HitSchedulerOutputType"],
  Inport: ["BusVirtuality", "DataMode", "IconDisplay", "MessageQueueType", "SignalType", "VarSizeSig"],
  Integrator: ["ExternalReset", "InitialConditionSource"],
  "Interpolation_n-D": ["DiagnosticForOutOfRangeInput", "ExtrapMethod", "InternalRulePriority", "InterpMethod", "RndMeth", "TableSource", "TableSpecification"],
  IsHermitian: ["Mode"],
  IsSymmetric: ["Mode"],
  IsTriangular: ["Mode"],
  Logic: ["IconShape", "Operator"],
  LookupNDDirect: ["DiagnosticForOutOfRangeInput", "InputsSelectThisObjectFromTable"],
  "Lookup_n-D": ["BreakpointsForDimension1Source", "BreakpointsForDimension2Source", "BreakpointsForDimension3Source", "BreakpointsSpecification", "DataSpecification", "DiagnosticForOutOfRangeInput", "ExtrapMethod", "IndexSearchMethod", "InternalRulePriority", "InterpMethod", "RndMeth", "TableSource"],
  MATLABFcn: ["OutputSignalType"],
  MATLABSystem: ["ExtrapMethod", "InterpMethod", "InterpolateDimension", "SimulateUsing"],
  MagnitudeAngleToComplex: ["ApproximationMethod", "Input"],
  Math: ["AlgorithmMethod", "AlgorithmType", "IntermediateResultsDataTypeStr", "Operator", "OutputSignalType", "RndMeth"],
  MinMax: ["CollapseMode", "Function", "RndMeth"],
  ModelReference: ["CodeInterface", "InputSignalHandling", "OutputSignalHandling", "ScheduleRatesWith", "SimulationMode"],
  MultiPortSwitch: ["DataPortForDefault", "DataPortOrder", "DiagnosticForDefault", "RndMeth"],
  Mux: ["DisplayOption"],
  Outport: ["BusVirtuality", "DataMode", "IconDisplay", "OutputWhenDisabled", "SignalType", "VarSizeSig"],
  PMIOPort: ["Side"],
  ParameterWriter: ["Destination"],
  Playback: ["ExtrapolationAfterLastDataPoint", "ExtrapolationBeforeFirstDataPoint"],
  PreLookup: ["BreakpointsDataSource", "BreakpointsSpecification", "DiagnosticForOutOfRangeInput", "ExtrapMethod", "IndexSearchMethod", "OutputSelection", "RndMeth"],
  Probe: ["ProbeComplexityDataType", "ProbeDimensionsDataType", "ProbeSampleTimeDataType", "ProbeWidthDataType"],
  Product: ["CollapseMode", "Multiplication", "RndMeth"],
  Queue: ["EntityArrivalSource", "QueueType", "SortingDirection"],
  RateLimiter: ["SampleTimeMode"],
  RateTransition: ["OutPortSampleTimeOpt"],
  RealImagToComplex: ["Input"],
  Receive: ["PriorityOrder", "QueueType", "ValueSourceWhenQueueIsEmpty"],
  Record: ["ParquetRowGroupPolicy"],
  RelationalOperator: ["Operator", "RndMeth"],
  Relay: ["InputProcessing"],
  Reshape: ["OutputDimensionality"],
  Rounding: ["Operator"],
  "S-Function": ["BiasBase", "BitMaskRealWorld", "ColEndMode", "ColSpan", "ColStartMode", "DelayOrder", "IfRefDouble", "IfRefSingle", "IsSigned", "LookUpMeth", "NumBitsBase", "PropDataTypeMode", "PropScalingMode", "RndMeth", "RowEndMode", "RowSpan", "RowStartMode", "SlopeBase", "ZeroOneIdxMode", "bitOrder", "errmode", "logicop", "mode", "outDtype", "outDtypeSigned", "signedInputValues", "signedOutputValues"],
  SampleTimeMath: ["RndMeth", "TsampMathImp", "TsampMathOp"],
  Saturate: ["RndMeth"],
  Scope: ["AxesScaling", "DataLoggingSaveFormat", "FrameBasedProcessingString", "MaximizeAxes", "TimeAxisLabels", "TimeSpanOverrunAction", "TimeUnits"],
  SecondOrderIntegrator: ["ExternalReset", "ICSourceDXDT", "ICSourceX", "ShowOutput"],
  Selector: ["IndexMode"],
  SignalConversion: ["ConversionOutput"],
  SignalGenerator: ["TimeSource", "Units", "WaveForm"],
  SignalSpecification: ["SignalType", "VarSizeSig"],
  Sin: ["SineType", "TimeSource"],
  Sqrt: ["Operator", "OutputSignalType", "RndMeth", "RsqrtAlgorithmType", "SqrtAlgorithmType"],
  StateControl: ["StateControl"],
  StateSpace: ["ParameterTunability"],
  StringCompare: ["CompareOption"],
  StringContains: ["Function"],
  SubSystem: ["AntiWindupMode", "BlockChoice", "Controller", "ControllerParametersSource", "ConvertRealWorld", "DocumentType", "ExecutionDomainType", "ExternalReset", "FilterMethod", "Form", "Formula", "Function", "FunctionInterfaceSpec", "InitialConditionSource", "InputProcessing", "IntegratorMethod", "InternalRulePriority", "LabelModeActiveChoice", "LookUpMeth", "OutputAfterFinalValue", "OutputDataType", "Permissions", "PermitHierarchicalResolution", "RTWFcnNameOpts", "RTWFileNameOpts", "RTWMemSecDataConstants", "RTWMemSecDataInternal", "RTWMemSecDataParameters", "RTWMemSecFuncExecute", "RTWMemSecFuncInitTerm", "RTWSystemCode", "RndMeth", "SatLimitsSource", "ScheduleAs", "ShowPortLabels", "SignalPropertySource", "TimeDomain", "TriggerType", "TunerSelectOption", "VariantActivationTime", "VariantControlMode", "bitsToExtract", "icon", "outScalingMode", "relop"],
  Sum: ["CollapseMode", "IconShape", "RndMeth"],
  Switch: ["Criteria", "RndMeth"],
  ToFile: ["SaveFormat"],
  ToWorkspace: ["Save2DSignal", "SaveFormat"],
  TransferFcn: ["ParameterTunability"],
  TriggerPort: ["FunctionVisibility", "InitialTriggerSignalState", "OutputDataType", "PropagateVarSize", "SampleTimeType", "StatesWhenEnabling", "TriggerTime", "TriggerType"],
  Trigonometry: ["AngleUnit", "ApproximationMethod", "InterpMethod", "Operator", "OutputSignalType"],
  UnitConversion: ["OutputType"],
  UnitDelay: ["InputProcessing"],
  VariableTransportDelay: ["VariableDelayType"],
  VariantSink: ["LabelModeActiveChoice", "VariantActivationTime", "VariantControlMode"],
  VariantSource: ["LabelModeActiveChoice", "VariantActivationTime", "VariantControlMode"],
  VariantStart: ["LabelModeActiveChoice", "VariantActivationTime", "VariantControlMode"],
  Width: ["DataType", "OutDataTypeMode"],
  ZeroPole: ["ParameterTunability"]
};

// node_modules/data-explorer-core/dist/datamodel/parser/MxArrayParser.js
var MXARRAY_MAGIC = [0, 1, 73, 77];
var MI_MATRIX5 = 14;
function ru32(buf, offset) {
  return (buf[offset] | buf[offset + 1] << 8 | buf[offset + 2] << 16 | buf[offset + 3] << 24) >>> 0;
}
function readMxArrayRecords(buffer) {
  const buf = new Uint8Array(buffer);
  const trailingElements = [];
  if (buf.length < 16) {
    return { outer: null, trailingElements };
  }
  if (buf[0] !== MXARRAY_MAGIC[0] || buf[1] !== MXARRAY_MAGIC[1] || buf[2] !== MXARRAY_MAGIC[2] || buf[3] !== MXARRAY_MAGIC[3]) {
    return { outer: null, trailingElements };
  }
  const outerTag = ru32(buf, 8);
  const outerSize = Math.min(ru32(buf, 12), buf.length - 16);
  if (outerTag !== MI_MATRIX5 || outerSize <= 0) {
    return { outer: null, trailingElements };
  }
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const outer = parseMatrix(view, 16, outerSize);
  let offset = 8 + 8 + outerSize;
  while (offset + 8 <= buf.length) {
    const tag = ru32(buf, offset);
    const size = ru32(buf, offset + 4);
    if (tag === 0 && size === 0) {
      break;
    }
    const available = buf.length - offset;
    const take = Math.min(8 + size, available);
    trailingElements.push(new Uint8Array(buf.buffer, buf.byteOffset + offset, take));
    if (take < 8 + size) {
      break;
    }
    offset += 8 + size;
  }
  return { outer, trailingElements };
}
function parseMxArray(buffer) {
  const result = [];
  const { outer, trailingElements } = readMxArrayRecords(buffer);
  result._trailingElements = trailingElements;
  if (!outer || !outer.fields) {
    return result;
  }
  for (const [name, fieldVar] of Object.entries(outer.fields)) {
    const variable = Array.isArray(fieldVar) ? fieldVar[0] : fieldVar;
    variable.name = name;
    result.push(variable);
  }
  return result;
}

// node_modules/data-explorer-core/dist/datamodel/parser/SlxParser.js
function decodeText(buf) {
  return new TextDecoder().decode(buf);
}
function parseJSON(buf) {
  return JSON.parse(decodeText(buf));
}
function parseXml2(buf) {
  return readModelXml(decodeText(buf));
}
function readPart(entries, path, lost, warnings) {
  const buf = entries[path];
  if (!buf) {
    return null;
  }
  let doc;
  try {
    doc = path.endsWith(".json") ? parseJSON(buf) : parseXml2(buf);
  } catch (err2) {
    warnings.push({
      code: "part-unreadable",
      message: `The model part "${path}" could not be read (${reasonOf(err2)}), so ${lost}.`,
      part: path
    });
    return null;
  }
  if (doc === null || typeof doc !== "object" || Object.keys(doc).length === 0) {
    warnings.push({
      code: "part-unreadable",
      message: `The model part "${path}" holds nothing readable, so ${lost}.`,
      part: path
    });
    return null;
  }
  return doc;
}
function configSetIdentity(data) {
  const blank = { objectClass: "", sourceName: "" };
  if (!data || typeof data !== "object")
    return blank;
  const rec = data;
  if (typeof rec._object_class === "string") {
    const props2 = rec._properties || {};
    return {
      objectClass: rec._object_class,
      sourceName: String(props2.SourceName ?? props2.WSVarName ?? "")
    };
  }
  const obj = typeof rec["@_ClassName"] === "string" ? rec : findAll(rec, "Object")[0];
  if (!obj || typeof obj["@_ClassName"] !== "string")
    return blank;
  const props = directProps(obj);
  return { objectClass: obj["@_ClassName"], sourceName: props.SourceName ?? props.WSVarName ?? "" };
}
function extractConfigSets(entries, configSetInfo, warnings) {
  const configs = [];
  for (const info of configSetInfo) {
    const partPath = info.PartName.replace(/^\//, "");
    if (!entries[partPath]) {
      warnings.push({
        code: "part-unreadable",
        message: `The configuration set "${info.ConfigSetName}" is listed as part "${partPath}", which this package does not contain, so that set was not read.`,
        part: partPath
      });
      continue;
    }
    const data = readPart(entries, partPath, `the configuration set "${info.ConfigSetName}" was not read`, warnings);
    if (data === null) {
      continue;
    }
    configs.push({
      name: info.ConfigSetName,
      active: !!info.Active,
      data,
      ...configSetIdentity(data)
    });
  }
  return configs;
}
function extractExternalDataSources(doc) {
  const sources = [];
  const brokerSources = findAll(doc, "ExplicitExternalBrokerSources");
  for (const el of brokerSources) {
    const pathVal = findText(el, "fullPathToSource");
    if (pathVal) {
      sources.push(pathVal);
    }
  }
  return sources;
}
function findAll(obj, tagName) {
  const results = [];
  if (!obj || typeof obj !== "object") {
    return results;
  }
  for (const [key, val] of Object.entries(obj)) {
    if (key === tagName) {
      results.push(...Array.isArray(val) ? val : [val]);
    } else if (typeof val === "object") {
      results.push(...findAll(val, tagName));
    }
  }
  return results;
}
function findText(obj, tagName) {
  for (const val of findAll(obj, tagName)) {
    const text = val && typeof val === "object" ? String(val["#text"] ?? "") : String(val ?? "");
    if (text) {
      return text;
    }
  }
  return null;
}
function directProps(el) {
  const out = {};
  if (!el || typeof el !== "object")
    return out;
  const p = el.P;
  if (!p)
    return out;
  for (const entry of Array.isArray(p) ? p : [p]) {
    if (!entry || typeof entry !== "object")
      continue;
    const rec = entry;
    const name = rec["@_Name"];
    if (typeof name !== "string")
      continue;
    out[name] = String(rec["#text"] ?? "");
  }
  return out;
}
function legacyModel(entries, warnings) {
  const doc = readPart(entries, "simulink/blockdiagram.xml", "this model's blocks, configuration sets and model references are all missing", warnings);
  if (!doc)
    return null;
  const info = doc.ModelInformation;
  const model = info?.Model ?? null;
  return model && typeof model === "object" ? model : null;
}
function legacyConfigSetInfo(doc) {
  const out = [];
  for (const el of findAll(doc, "ConfigSet")) {
    if (!el || typeof el !== "object")
      continue;
    const rec = el;
    const partName = rec["@_PartName"];
    if (typeof partName !== "string")
      continue;
    out.push({
      PartName: partName,
      ConfigSetName: String(rec["#text"] ?? ""),
      Active: String(rec["@_Active"] ?? "") === "true"
    });
  }
  return out;
}
function inlineConfigSets(model) {
  const container = model.ConfigurationSet;
  if (!container)
    return [];
  let activeId = "";
  for (const ref of findAll(model, "Object")) {
    if (!ref || typeof ref !== "object")
      continue;
    const rec = ref;
    if (rec["@_PropName"] === "ActiveConfigurationSet") {
      activeId = String(rec["@_ObjectID"] ?? "");
      break;
    }
  }
  const out = [];
  for (const obj of findAll(container, "Object")) {
    if (!obj || typeof obj !== "object")
      continue;
    const rec = obj;
    const cls = rec["@_ClassName"];
    if (cls !== "Simulink.ConfigSet" && cls !== "Simulink.ConfigSetRef")
      continue;
    const name = directProps(rec).Name;
    if (!name)
      continue;
    const id = String(rec["@_ObjectID"] ?? "");
    out.push({ name, active: !!id && id === activeId, data: rec, ...configSetIdentity(rec) });
  }
  return out;
}
var SYSTEMS_DIR = "simulink/systems/";
function partRef(key) {
  return key.slice(SYSTEMS_DIR.length, -".xml".length);
}
function systemRefsIn(obj, out) {
  if (!obj || typeof obj !== "object")
    return;
  for (const [key, val] of Object.entries(obj)) {
    for (const item of Array.isArray(val) ? val : [val]) {
      if (!item || typeof item !== "object")
        continue;
      const ref = item["@_Ref"];
      if (key === "System" && typeof ref === "string")
        out.add(ref);
      systemRefsIn(item, out);
    }
  }
}
function legacyModelReferences(root) {
  const out = [];
  for (const ref of findAll(root, "ModelReference")) {
    const path = directProps(ref).ModelRefBlockPath;
    if (!path)
      continue;
    const cut = path.lastIndexOf("|");
    if (cut < 0)
      continue;
    out.push({ blockPath: path.slice(0, cut), modelName: path.slice(cut + 1) });
  }
  return out;
}
var NUMERIC_RE = /^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
var NON_FINITE_RE = /^[+-]?(inf|nan)$/i;
var IDENT_RE = /[A-Za-z_]\w*/;
var NON_PARAM_PROPS = /* @__PURE__ */ new Set([
  "Position",
  "ZOrder",
  "FontName",
  "FontSize",
  "ForegroundColor",
  "BackgroundColor",
  "NameLocation",
  "ShowName",
  "BlockMirror",
  "BlockRotation",
  "Orientation",
  "Ports",
  "MaskType",
  "SourceBlock",
  "SourceType",
  "IconShape",
  "RndMeth",
  "SaturateOnIntegerOverflow",
  "OutDataTypeStr",
  "ParamDataTypeStr",
  "DataTypeStr",
  "IOType",
  "GraphicalSettings",
  "WindowPosition",
  "MultipleDisplayCache",
  "LayoutDimensionsString",
  "DataLoggingSaveFormat",
  "OpenFcn",
  "Units",
  "WaveForm",
  "MinAlgLoopOccurrences",
  "TreatAsAtomicUnit",
  "RequestExecContextInheritance",
  // Bookkeeping a ModelReference block carries in the CLASSIC .mdl only: the name
  // the referenced model had when the block was last copied. It is not a parameter
  // expression, and leaving it in gave the classic flavour of a file an extra
  // `Child / CopyOfModelName` row the .slx flavour of the SAME model did not have.
  "CopyOfModelName"
]);
function normalizeBlockName(name) {
  return name.replace(/&#x0*(a|d);/gi, " ").replace(/&#0*(10|13);/g, " ").replace(/\s+/g, " ").trim();
}
function valueReferencesData(value) {
  if (!value || NUMERIC_RE.test(value))
    return false;
  if (NON_FINITE_RE.test(value))
    return false;
  if (value === "on" || value === "off")
    return false;
  return IDENT_RE.test(value);
}
var NON_DATA_BLOCK_PARAMS = {
  BusSelector: ["OutputSignals"],
  BusAssignment: ["AssignedSignals"],
  ModelReference: ["ModelNameDialog", "ModelFile", "ModelName"]
};
var NON_DATA_PARAMS = (() => {
  const merged = /* @__PURE__ */ new Map();
  for (const table of [ENUM_BLOCK_PARAMS, NON_DATA_BLOCK_PARAMS]) {
    for (const [blockType, params] of Object.entries(table)) {
      const set = merged.get(blockType) ?? /* @__PURE__ */ new Set();
      for (const p of params)
        set.add(p);
      merged.set(blockType, set);
    }
  }
  return merged;
})();
function isParamReference(blockType, propName2, value) {
  if (!propName2 || NON_PARAM_PROPS.has(propName2))
    return false;
  if (NON_DATA_PARAMS.get(blockType)?.has(propName2))
    return false;
  return valueReferencesData(value);
}
var EXPRESSION_MASK_TYPES = /* @__PURE__ */ new Set(["edit", "slider", "dial", "spinbox", "min", "max"]);
function isExpressionMaskType(type) {
  return EXPRESSION_MASK_TYPES.has(type.trim().toLowerCase());
}
function extractBlockParamUsages(entries, legacy, warnings) {
  const usages = [];
  const masks = [];
  const collect = (system, path, descend) => {
    for (const block of findAll(system, "Block")) {
      const b = block;
      const blockName = normalizeBlockName(b["@_Name"] || "");
      const blockType = b["@_BlockType"] || "";
      const sid = b["@_SID"] === void 0 || b["@_SID"] === null ? "" : String(b["@_SID"]);
      const props = b["P"];
      for (const p of props ? Array.isArray(props) ? props : [props] : []) {
        const pObj = p;
        const propName2 = pObj["@_Name"];
        const val = pObj["#text"] || "";
        if (!isParamReference(blockType, propName2, val))
          continue;
        usages.push({ blockName, blockType, paramProperty: propName2, paramValue: val, sid, systemPath: path });
      }
      const mask = b["Mask"];
      if (mask) {
        const names = [];
        const params = mask["MaskParameter"];
        for (const one of params ? Array.isArray(params) ? params : [params] : []) {
          const mp = one;
          const paramName = mp["@_Name"] === void 0 ? "" : String(mp["@_Name"]);
          if (paramName === "")
            continue;
          names.push(paramName);
          const type = mp["@_Type"] === void 0 ? "edit" : String(mp["@_Type"]);
          if (!isExpressionMaskType(type))
            continue;
          if (String(mp["@_Evaluate"] ?? "on") === "off")
            continue;
          const raw = mp["Value"];
          if (raw === void 0 || raw === null)
            continue;
          const val = String(raw);
          if (!valueReferencesData(val))
            continue;
          usages.push({ blockName, blockType, paramProperty: paramName, paramValue: val, sid, systemPath: path });
        }
        if (names.length > 0) {
          masks.push({ sid, blockName, blockPath: joinBlockPath(path, blockLabel(blockName, sid)), names });
        }
      }
      const inner = b.System;
      if (!inner)
        continue;
      const childPath = joinBlockPath(path, blockLabel(blockName, sid));
      for (const one of Array.isArray(inner) ? inner : [inner]) {
        const ref = one?.["@_Ref"];
        if (typeof ref === "string") {
          descend(ref, childPath);
        } else {
          collect(one, childPath, descend);
        }
      }
    }
  };
  const parts = /* @__PURE__ */ new Map();
  for (const key in entries) {
    if (key.startsWith(SYSTEMS_DIR) && key.endsWith(".xml")) {
      const root = readPart(entries, key, "the blocks it holds are missing", warnings);
      if (root !== null) {
        parts.set(partRef(key), root);
      }
    }
  }
  if (parts.size > 0) {
    const visited = /* @__PURE__ */ new Set();
    const descend = (ref, into) => {
      if (visited.has(ref))
        return;
      visited.add(ref);
      const part = parts.get(ref);
      if (part !== void 0)
        collect(part, into, descend);
    };
    const referenced = /* @__PURE__ */ new Set();
    for (const part of parts.values())
      systemRefsIn(part, referenced);
    for (const ref of parts.keys()) {
      if (!referenced.has(ref))
        descend(ref, "");
    }
    for (const ref of parts.keys())
      descend(ref, "");
  } else if (legacy && legacy.System) {
    for (const system of Array.isArray(legacy.System) ? legacy.System : [legacy.System]) {
      collect(system, "", () => void 0);
    }
  }
  return { usages, masks };
}
function extractModelReferences(graphicalInterface) {
  if (!graphicalInterface) {
    return [];
  }
  const gi = graphicalInterface.GraphicalInterface || graphicalInterface;
  const refs = gi.ModelReferences;
  if (!refs) {
    return [];
  }
  return refs.map(function(ref) {
    return { blockPath: ref.BlockPath, modelName: ref.ModelName };
  });
}
function parseSlx(buffer, filename) {
  return parseModelParts(unzipEntries(new Uint8Array(buffer)), filename);
}
function parseModelParts(entries, filename) {
  const warnings = [];
  let release = "";
  let creator = "";
  let lastModified = "";
  const core = readPart(entries, "metadata/coreProperties.xml", "this model's release, creator and last-modified date are missing", warnings);
  if (core) {
    release = findText(core, "cp:version") || findText(core, "version") || "";
    creator = findText(core, "dc:creator") || findText(core, "creator") || "";
    lastModified = findText(core, "dcterms:modified") || findText(core, "modified") || "";
  }
  const legacy = legacyModel(entries, warnings);
  let dataDictionary = null;
  let uuid = "";
  let workspaceMatFile = null;
  if (entries["simulink/blockDiagram.json"]) {
    const bd = readPart(entries, "simulink/blockDiagram.json", "this model's dictionary link, its UUID and its model-workspace source are missing", warnings);
    const diagram = bd ? bd.BlockDiagram || bd : {};
    dataDictionary = diagram.DataDictionary || null;
    uuid = diagram.ModelUUID || "";
    const ws = diagram.ModelWorkspace;
    if (ws && ws.WSDataSource === "MAT-File" && typeof ws.WSSourceFileName === "string") {
      workspaceMatFile = ws.WSSourceFileName;
    }
  } else if (legacy) {
    const props = directProps(legacy);
    dataDictionary = props.DataDictionary || null;
    uuid = props.ModelUUID || "";
    const wsProps = directProps(legacy.ModelWorkspace);
    if (wsProps.WSDataSource === "MAT-File" && wsProps.WSSourceFileName) {
      workspaceMatFile = wsProps.WSSourceFileName;
    }
  }
  let configSets = [];
  if (entries["simulink/configSetInfo.json"]) {
    const info = readPart(entries, "simulink/configSetInfo.json", "no configuration sets were read", warnings);
    configSets = extractConfigSets(entries, info?.ConfigSetInfo || [], warnings);
  } else if (entries["simulink/configSetInfo.xml"]) {
    const info = readPart(entries, "simulink/configSetInfo.xml", "no configuration sets were read", warnings);
    configSets = extractConfigSets(entries, legacyConfigSetInfo(info), warnings);
  } else if (legacy) {
    configSets = inlineConfigSets(legacy);
  }
  let modelReferences = [];
  const REFS_LOST = "this model's references to other models are missing";
  if (entries["simulink/graphicalInterface.json"]) {
    const gi = readPart(entries, "simulink/graphicalInterface.json", REFS_LOST, warnings);
    modelReferences = gi ? extractModelReferences(gi) : [];
  } else if (entries["simulink/graphicalInterface.xml"]) {
    modelReferences = legacyModelReferences(readPart(entries, "simulink/graphicalInterface.xml", REFS_LOST, warnings));
  } else if (legacy && legacy.GraphicalInterface) {
    modelReferences = legacyModelReferences(legacy.GraphicalInterface);
  }
  let externalDataSources = [];
  const eds = readPart(entries, "simulink/ExternalDataSourceSettings.xml", "this model's external data sources are missing", warnings);
  if (eds) {
    externalDataSources = extractExternalDataSources(eds);
  }
  if (workspaceMatFile && !externalDataSources.includes(workspaceMatFile)) {
    externalDataSources.push(workspaceMatFile);
  }
  let workspace = [];
  workspace._trailingElements = [];
  if (entries["simulink/modelWorkspace.mxarray"]) {
    const part = entries["simulink/modelWorkspace.mxarray"];
    workspace = parseMxArray(part.buffer);
    if (workspace.length === 0) {
      const { outer } = readMxArrayRecords(part.buffer);
      if (!outer || !outer.fields) {
        warnings.push({
          code: "part-unreadable",
          message: `The model part "simulink/modelWorkspace.mxarray" does not hold a decodable workspace, so this model's workspace variables were not read.`,
          part: "simulink/modelWorkspace.mxarray"
        });
      }
    }
  } else if (entries["simulink/modelworkspace.mat"]) {
    const buf = entries["simulink/modelworkspace.mat"];
    try {
      const mat = parseMat(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
      workspace = mat.variables;
      for (const inner of mat.warnings) {
        warnings.push({
          ...inner,
          part: inner.part ? `simulink/modelworkspace.mat#${inner.part}` : "simulink/modelworkspace.mat"
        });
      }
    } catch (err2) {
      warnings.push({
        code: "part-unreadable",
        message: `The model part "simulink/modelworkspace.mat" could not be read (${reasonOf(err2)}), so this model's workspace variables were not read.`,
        part: "simulink/modelworkspace.mat"
      });
    }
    workspace._trailingElements = [];
  }
  const { usages: blockParamUsages, masks } = extractBlockParamUsages(entries, legacy, warnings);
  const rawContents = {};
  for (const key in entries) {
    if (key.endsWith(".xml") || key.endsWith(".json")) {
      rawContents[key] = decodeText(entries[key]);
    }
  }
  return {
    name: filename,
    release,
    creator,
    lastModified,
    uuid,
    dataDictionary,
    modelReferences,
    externalDataSources,
    configSets,
    workspace,
    blockParamUsages,
    masks,
    rawContents,
    zipEntries: entries,
    warnings
  };
}

// node_modules/data-explorer-core/dist/datamodel/parser/MdlParser.js
function parseMdl(buffer, filename) {
  const bytes = new Uint8Array(buffer);
  const framing = [];
  const parts = decodeOpcTextPackage(bytes, framing);
  if (parts && Object.keys(parts).length > 0) {
    const parsed2 = parseModelParts(parts, filename);
    parsed2.warnings = [...framing, ...parsed2.warnings];
    return parsed2;
  }
  const parsed = parseClassicMdl(bytes, filename);
  if (parts !== null) {
    parsed.warnings = [
      {
        code: "source-unreadable",
        message: `"${filename}" begins an OPC text package that holds no readable part, so none of this model was read.`
      }
    ];
  }
  return parsed;
}
var PACKAGE_BEGIN = "__MWOPC_PACKAGE_BEGIN__";
var NL_PART_BEGIN = "\n__MWOPC_PART_BEGIN__";
var NL_PACKAGE_END = "\n__MWOPC_PACKAGE_END__";
var PART_BEGIN_LEN = NL_PART_BEGIN.length - 1;
var SNIFF_BYTES = 4096;
var LF = 10;
var CR = 13;
function indexOfAscii(bytes, text, from, limit) {
  const first = text.charCodeAt(0);
  const end = Math.min(limit ?? bytes.length, bytes.length) - text.length;
  for (let i = from; i <= end; i++) {
    if (bytes[i] !== first)
      continue;
    let k = 1;
    while (k < text.length && bytes[i + k] === text.charCodeAt(k))
      k++;
    if (k === text.length)
      return i;
  }
  return -1;
}
function decodeOpcTextPackage(bytes, warnings) {
  const begin = indexOfAscii(bytes, PACKAGE_BEGIN, 0, SNIFF_BYTES);
  if (begin < 0) {
    return null;
  }
  const parts = {};
  let at = indexOfAscii(bytes, NL_PART_BEGIN, begin);
  while (at >= 0) {
    const headerEnd = indexOfByte(bytes, LF, at + 1);
    if (headerEnd < 0) {
      warnings.push({
        code: "part-unreadable",
        message: `A part header at byte ${at + 1} of this OPC text package is cut off before its path, so that part and anything after it were not read.`
      });
      break;
    }
    const header = decodeText2(bytes.subarray(at + 1 + PART_BEGIN_LEN, headerEnd)).trim();
    const base64 = / BASE64$/.test(header);
    const path = (base64 ? header.slice(0, -" BASE64".length) : header).trim().replace(/^\//, "");
    const contentStart = headerEnd + 1;
    const next = nextBoundary(bytes, contentStart);
    let contentEnd = next < 0 ? bytes.length : next;
    if (next < 0 && contentEnd > contentStart && bytes[contentEnd - 1] === LF)
      contentEnd--;
    if (contentEnd > contentStart && bytes[contentEnd - 1] === CR)
      contentEnd--;
    const raw = bytes.subarray(contentStart, contentEnd);
    if (path) {
      parts[path] = base64 ? decodeBase64(raw) : raw.slice();
    } else {
      warnings.push({
        code: "part-unreadable",
        message: `A part header at byte ${at + 1} of this OPC text package names no path, so the part that follows it was not read.`
      });
    }
    at = next < 0 ? -1 : indexOfAscii(bytes, NL_PART_BEGIN, next);
  }
  return parts;
}
function indexOfByte(bytes, byte, from) {
  for (let i = from; i < bytes.length; i++) {
    if (bytes[i] === byte)
      return i;
  }
  return -1;
}
function nextBoundary(bytes, from) {
  const part = indexOfAscii(bytes, NL_PART_BEGIN, from);
  const end = indexOfAscii(bytes, NL_PACKAGE_END, from);
  if (part < 0)
    return end;
  if (end < 0)
    return part;
  return Math.min(part, end);
}
var B64_VALUES = (function() {
  const table = new Int8Array(256).fill(-1);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (let i = 0; i < alphabet.length; i++) {
    table[alphabet.charCodeAt(i)] = i;
  }
  return table;
})();
function decodeBase64(bytes) {
  const out = new Uint8Array(Math.ceil(bytes.length * 3 / 4));
  let acc = 0;
  let bits2 = 0;
  let n = 0;
  for (let i = 0; i < bytes.length; i++) {
    const value = B64_VALUES[bytes[i]];
    if (value < 0)
      continue;
    acc = acc << 6 | value;
    bits2 += 6;
    if (bits2 >= 8) {
      bits2 -= 8;
      out[n++] = acc >> bits2 & 255;
    }
  }
  return out.slice(0, n);
}
function decodeText2(buf) {
  return new TextDecoder().decode(buf);
}
var NAME_START_RE = /[A-Za-z_$]/;
var NAME_CHAR_RE = /[\w.$]/;
function parseClassicTree(text) {
  const root = { name: "", props: [], children: [] };
  const stack = [root];
  const c = { src: text, i: 0 };
  while (true) {
    skipSpace(c);
    if (c.i >= c.src.length)
      break;
    const ch = c.src[c.i];
    if (ch === "}") {
      c.i++;
      if (stack.length > 1)
        stack.pop();
      continue;
    }
    if (!NAME_START_RE.test(ch)) {
      readValue(c);
      continue;
    }
    const name = readName(c);
    skipInlineSpace(c);
    if (c.src[c.i] === "{") {
      c.i++;
      const child = { name, props: [], children: [] };
      stack[stack.length - 1].children.push(child);
      stack.push(child);
      continue;
    }
    const value = atLineEnd(c) ? "" : readValue(c);
    stack[stack.length - 1].props.push({ name, value });
  }
  return root;
}
function skipSpace(c) {
  while (c.i < c.src.length) {
    const ch = c.src[c.i];
    if (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
      c.i++;
    } else if (ch === "#") {
      while (c.i < c.src.length && c.src[c.i] !== "\n")
        c.i++;
    } else {
      break;
    }
  }
}
function skipInlineSpace(c) {
  while (c.i < c.src.length && (c.src[c.i] === " " || c.src[c.i] === "	"))
    c.i++;
}
function atLineEnd(c) {
  const ch = c.src[c.i];
  return c.i >= c.src.length || ch === "\n" || ch === "\r" || ch === "}";
}
function readName(c) {
  const start = c.i;
  while (c.i < c.src.length && NAME_CHAR_RE.test(c.src[c.i]))
    c.i++;
  return c.src.slice(start, c.i);
}
function readValue(c) {
  const ch = c.src[c.i];
  if (ch === '"')
    return readQuoted(c);
  if (ch === "[")
    return readBracketed(c);
  const start = c.i;
  while (c.i < c.src.length && c.src[c.i] !== "\n" && c.src[c.i] !== "\r")
    c.i++;
  return c.src.slice(start, c.i).trim();
}
function readQuoted(c) {
  let out = "";
  for (; ; ) {
    c.i++;
    while (c.i < c.src.length) {
      const ch = c.src[c.i];
      if (ch === "\\") {
        out += unescapeChar(c.src[c.i + 1]);
        c.i += 2;
        continue;
      }
      if (ch === '"')
        break;
      out += ch;
      c.i++;
    }
    c.i++;
    const resume = c.i;
    skipSpace(c);
    if (c.src[c.i] === '"')
      continue;
    c.i = resume;
    return out;
  }
}
function unescapeChar(ch) {
  switch (ch) {
    case "n":
      return "\n";
    case "r":
      return "\r";
    case "t":
      return "	";
    case '"':
      return '"';
    case "\\":
      return "\\";
    case void 0:
      return "";
    default:
      return "\\" + ch;
  }
}
function readBracketed(c) {
  const start = c.i;
  let depth = 0;
  while (c.i < c.src.length) {
    const ch = c.src[c.i];
    if (ch === '"') {
      readQuoted(c);
      continue;
    }
    if (ch === "[") {
      depth++;
    } else if (ch === "]") {
      depth--;
      c.i++;
      if (depth <= 0)
        break;
      continue;
    }
    c.i++;
  }
  return c.src.slice(start, c.i);
}
function prop(node, name) {
  if (!node)
    return null;
  for (const p of node.props) {
    if (p.name === name)
      return p.value;
  }
  return null;
}
function childNamed(node, name) {
  if (!node)
    return null;
  return node.children.find((ch) => ch.name === name) || null;
}
function childrenNamed(node, name) {
  if (!node)
    return [];
  return node.children.filter((ch) => ch.name === name);
}
function flatProps(node) {
  const out = {};
  for (const p of node.props)
    out[p.name] = p.value;
  return out;
}
var ENCODING_SNIFF_BYTES = 8192;
var SAVED_ENCODING_RE = /^[ \t]*SavedCharacterEncoding[ \t]+"?([^"\r\n]*)"?/m;
function decodeClassicText(bytes) {
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, ENCODING_SNIFF_BYTES));
  const label = (SAVED_ENCODING_RE.exec(head)?.[1] ?? "").trim();
  if (!label || /^utf-?8$/i.test(label))
    return decodeText2(bytes);
  let decoded;
  try {
    decoded = new TextDecoder(label).decode(bytes);
  } catch {
    return decodeText2(bytes);
  }
  if (!SAVED_ENCODING_RE.test(decoded.slice(0, ENCODING_SNIFF_BYTES)))
    return decodeText2(bytes);
  return decoded;
}
function parseClassicMdl(bytes, filename) {
  const warnings = [];
  const root = parseClassicTree(decodeClassicText(bytes));
  const model = childNamed(root, "Model") || childNamed(root, "Library");
  if (!model) {
    throw new Error(`Not a Simulink model: "${filename}" is not a zip package, not an OPC text package, and has no Model or Library block`);
  }
  const modelName = prop(model, "Name") || "";
  const externalDataSources = [];
  const wsFile = prop(model, "WSSourceFileName");
  if (prop(model, "WSDataSource") === "MAT-File" && wsFile) {
    externalDataSources.push(wsFile);
  }
  return {
    name: filename,
    // A classic `.mdl` has no release string. It records a Simulink VERSION number
    // (`Version 7.8`), which is not the release a `.slx` names in its
    // coreProperties, and no table maps one to the other — so this stays empty
    // rather than reporting a release the file never claimed.
    release: "",
    creator: prop(model, "Creator") || "",
    // `Fri Sep 04 10:15:32 2026`, where a `.slx` gives ISO 8601. Both are passed
    // through as written; neither format is reinterpreted here.
    lastModified: prop(model, "LastModifiedDate") || "",
    // Also absent before R2012: a model had no UUID to record.
    uuid: prop(model, "ModelUUID") || "",
    // R2011b cannot use a data dictionary and drops the link on export (with a
    // warning); R2017b keeps it. Absent means absent.
    dataDictionary: prop(model, "DataDictionary") || null,
    modelReferences: classicModelReferences(model, modelName),
    externalDataSources,
    configSets: classicConfigSets(model),
    workspace: classicWorkspace(root, model, warnings),
    ...classicBlockParamUsages(model),
    // There are no OPC parts to hand back: this flavour is one flat text file, not
    // an archive. ModelNode treats both as nullable and falls back to a summary.
    rawContents: null,
    zipEntries: null,
    warnings
  };
}
function classicModelReferences(model, modelName) {
  const gi = childNamed(model, "GraphicalInterface");
  const refs = [];
  for (const ref of childrenNamed(gi, "ModelReference")) {
    const raw = prop(ref, "ModelRefBlockPath");
    const cut = raw ? raw.lastIndexOf("|") : -1;
    if (!raw || cut < 0)
      continue;
    refs.push({ blockPath: rootRelativePath(raw.slice(0, cut), modelName), modelName: raw.slice(cut + 1) });
  }
  if (refs.length === 0) {
    for (const ext of childrenNamed(gi, "ExternalFileReference")) {
      const name = prop(ext, "Reference");
      if (!name || prop(ext, "Type") !== "MODEL_BLOCK")
        continue;
      refs.push({ blockPath: rootRelativePath(prop(ext, "Path") || "", modelName), modelName: name });
    }
  }
  return refs;
}
function rootRelativePath(path, modelName) {
  if (!modelName)
    return path;
  if (path === modelName)
    return "$bdroot";
  if (path.startsWith(modelName + "/"))
    return "$bdroot/" + path.slice(modelName.length + 1);
  return path;
}
function classicConfigSets(model) {
  let activeId = null;
  for (const node of model.children) {
    if (prop(node, "$PropName") === "ActiveConfigurationSet") {
      activeId = prop(node, "$ObjectID");
    }
  }
  const configs = [];
  for (const array of childrenNamed(model, "Array")) {
    if (prop(array, "PropName") !== "ConfigurationSets")
      continue;
    for (const cs of array.children) {
      const name = prop(cs, "Name");
      if (!name)
        continue;
      const data = { _object_class: cs.name, _properties: flatProps(cs) };
      configs.push({
        name,
        active: activeId !== null && prop(cs, "$ObjectID") === activeId,
        data,
        ...configSetIdentity(data)
      });
    }
  }
  return configs;
}
var BLOCK_IDENTITY_PROPS = /* @__PURE__ */ new Set(["BlockType", "Name", "SID"]);
var MASK_PROPS = /* @__PURE__ */ new Set([
  "MaskType",
  "MaskDescription",
  "MaskHelp",
  "MaskPromptString",
  "MaskStyleString",
  "MaskStyles",
  "MaskVariables",
  "MaskVariableAliases",
  "MaskVarAliasString",
  "MaskTunableValueString",
  "MaskTunableValues",
  "MaskCallbackString",
  "MaskCallbacks",
  "MaskEnableString",
  "MaskEnables",
  "MaskVisibilityString",
  "MaskVisibilities",
  "MaskToolTipString",
  "MaskTooltipString",
  "MaskInitialization",
  "MaskDisplay",
  "MaskIconFrame",
  "MaskIconOpaque",
  "MaskIconRotate",
  "MaskIconUnits",
  "MaskPortRotate",
  "MaskRunInitForIconRedraw",
  "MaskSelfModifiable",
  "MaskValueString",
  "MaskValues",
  "MaskNames",
  "MaskObject"
]);
function classicMask(block) {
  const vars = prop(block, "MaskVariables") || "";
  const styles = splitMaskStyles(prop(block, "MaskStyleString") || "");
  const values = (prop(block, "MaskValueString") || "").split("|");
  const names = [];
  const params = [];
  for (const decl of vars.split(";")) {
    const parsed = /^\s*([A-Za-z_]\w*)\s*=\s*([@&])(\d+)\s*$/.exec(decl);
    if (!parsed) {
      continue;
    }
    const [, name, evaluated, index] = parsed;
    names.push(name);
    const slot = Number(index) - 1;
    if (evaluated !== "@" || slot < 0 || slot >= values.length) {
      continue;
    }
    const type = (styles[slot] ?? "edit").replace(/\(.*$/, "").trim().toLowerCase();
    if (!isExpressionMaskType(type)) {
      continue;
    }
    params.push({ name, value: values[slot] });
  }
  return { names, params };
}
function splitMaskStyles(styles) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < styles.length; i++) {
    const c = styles[i];
    if (c === "(") {
      depth++;
    } else if (c === ")") {
      depth = depth > 0 ? depth - 1 : 0;
    } else if (c === "," && depth === 0) {
      out.push(styles.slice(start, i));
      start = i + 1;
    }
  }
  out.push(styles.slice(start));
  return out;
}
function classicBlockParamUsages(model) {
  const usages = [];
  const masks = [];
  const systems = childrenNamed(model, "System").map((system) => ({ system, path: "" }));
  for (let s = 0; s < systems.length; s++) {
    const path = systems[s].path;
    for (const block of childrenNamed(systems[s].system, "Block")) {
      const blockName = normalizeBlockName(prop(block, "Name") || "");
      const blockType = prop(block, "BlockType") || "";
      const sid = prop(block, "SID") || "";
      for (const p of block.props) {
        if (BLOCK_IDENTITY_PROPS.has(p.name))
          continue;
        if (MASK_PROPS.has(p.name))
          continue;
        if (!isParamReference(blockType, p.name, p.value))
          continue;
        usages.push({ blockName, blockType, paramProperty: p.name, paramValue: p.value, sid, systemPath: path });
      }
      const childPath = joinBlockPath(path, blockLabel(blockName, sid));
      const mask = classicMask(block);
      for (const param of mask.params) {
        if (!valueReferencesData(param.value))
          continue;
        usages.push({
          blockName,
          blockType,
          paramProperty: param.name,
          paramValue: param.value,
          sid,
          systemPath: path
        });
      }
      if (mask.names.length > 0) {
        masks.push({ sid, blockName, blockPath: childPath, names: mask.names });
      }
      for (const inner of childrenNamed(block, "System"))
        systems.push({ system: inner, path: childPath });
    }
  }
  return { blockParamUsages: usages, masks };
}
function classicWorkspace(root, model, warnings) {
  const empty = [];
  empty._trailingElements = [];
  const tag = prop(model, "WSMdlFileData");
  if (!tag)
    return empty;
  const matData = childNamed(root, "MatData");
  if (!matData) {
    warnings.push({
      code: "part-unreadable",
      message: `This model's workspace is stored as record "${tag}", but the file has no MatData section, so its workspace variables were not read.`,
      part: tag
    });
    return empty;
  }
  let encoded = null;
  let found = false;
  for (const record of childrenNamed(matData, "DataRecord")) {
    if (prop(record, "Tag") === tag) {
      found = true;
      encoded = prop(record, "Data");
      break;
    }
  }
  if (!encoded) {
    warnings.push({
      code: "part-unreadable",
      message: found ? `This model's workspace record "${tag}" holds no data, so its workspace variables were not read.` : `This model's workspace is stored as record "${tag}", which the file's MatData section does not contain, so its workspace variables were not read.`,
      part: tag
    });
    return empty;
  }
  const stream = uudecode2(encoded);
  const { outer, trailingElements } = readMxArrayRecords(stream.buffer);
  if (!outer || !outer.fields) {
    warnings.push({
      code: "part-unreadable",
      message: `This model's workspace record "${tag}" does not decode to a workspace, so its variables were not read.`,
      part: tag
    });
    return empty;
  }
  if (!outer.fields.Name || !outer.fields.Value) {
    return parseMxArray(stream.buffer);
  }
  const result = [];
  result._trailingElements = trailingElements;
  const names = elementsOf(outer.fields.Name);
  const values = elementsOf(outer.fields.Value);
  for (let i = 0; i < names.length && i < values.length; i++) {
    const name = typeof names[i].value === "string" ? names[i].value : "";
    if (!name)
      continue;
    values[i].name = name;
    result.push(values[i]);
  }
  return result;
}
function elementsOf(field) {
  return Array.isArray(field) ? field : [field];
}
function uudecode2(text) {
  const out = new Uint8Array(Math.ceil(text.length * 6 / 8));
  let acc = 0;
  let bits2 = 0;
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === LF || code === CR)
      continue;
    acc = acc << 6 | code - 32 & 63;
    bits2 += 6;
    if (bits2 >= 8) {
      bits2 -= 8;
      out[n++] = acc >> bits2 & 255;
    }
  }
  return out.slice(0, n);
}

// node_modules/data-explorer-core/dist/datamodel/parser/ModelParser.js
var ZIP_MAGIC = [80, 75, 3, 4];
function isZipPackage(bytes) {
  return ZIP_MAGIC.every((byte, i) => bytes[i] === byte);
}
function parseModel(buffer, filename) {
  return isZipPackage(new Uint8Array(buffer)) ? parseSlx(buffer, filename) : parseMdl(buffer, filename);
}

// node_modules/data-explorer-core/dist/datamodel/parser/ProjectParser.js
var PROJECT_PREFIX = "resources/project/";
var MANIFEST = "Project.xml";
var FIXED_PATH_V2 = "fixedPathV2";
var DISTRIBUTED = "distributed";
var NOT_REFERENCE_COLLECTIONS = /* @__PURE__ */ new Set([
  "ProjectPath",
  "WorkingFolders",
  "Categories",
  "Files",
  "EntryPoints",
  "EntryPointGroups",
  "Info"
]);
function toArray(v) {
  if (v === void 0 || v === null) {
    return [];
  }
  return Array.isArray(v) ? v : [v];
}
function emptyResult(name, warnings) {
  return {
    name,
    format: "",
    files: [],
    pathFolders: [],
    labels: [],
    references: [],
    entryPoints: [],
    entryPointGroups: [],
    workingFolders: [],
    warnings
  };
}
function parseProject(files, projectName) {
  const warnings = [];
  const result = emptyResult(projectName, warnings);
  try {
    const index = /* @__PURE__ */ new Map();
    for (const [relPath, content] of Object.entries(files)) {
      if (!relPath.startsWith(PROJECT_PREFIX)) {
        continue;
      }
      if (!relPath.endsWith(".xml")) {
        continue;
      }
      const info = parseInfo(content, relPath, warnings);
      if (info) {
        index.set(relPath.slice(PROJECT_PREFIX.length), info);
      }
    }
    if (index.size === 0) {
      const toml = Object.keys(files).find((k) => k.startsWith(PROJECT_PREFIX) && k.slice(PROJECT_PREFIX.length).endsWith("matlab.toml"));
      warnings.push(toml ? {
        // 'source-empty' rather than a code of its own: the code is the kind of
        // loss (the source opened and held nothing this reader recognizes) and
        // the message is which, per ParseWarningCode's note that the codes are
        // about containers and parts and not about any one format.
        code: "source-empty",
        message: "This project stores its metadata as matlab.toml, which this viewer cannot read yet, so this project reads as empty. In MATLAB, Project Settings can save it as XML instead.",
        part: toml
      } : {
        code: "source-empty",
        message: "No readable project entries were found under resources/project/, so this project reads as empty."
      });
      return result;
    }
    const declared = index.get(MANIFEST)?.["@_MetadataType"] ?? "";
    const layoutName = declared || inferLayout(index);
    if (layoutName !== FIXED_PATH_V2 && layoutName !== DISTRIBUTED) {
      result.name = salvageName(index) ?? projectName;
      warnings.push({
        code: "source-empty",
        message: declared ? `This project's metadata is stored as "${declared}", which this viewer cannot read yet, so this project reads as empty. In MATLAB, Project Settings can save it as multiple XML files instead.` : "The layout of this project store was not recognized, so this project reads as empty.",
        part: PROJECT_PREFIX + MANIFEST
      });
      return result;
    }
    result.format = layoutName;
    const layout = layoutName === FIXED_PATH_V2 ? fixedPathV2Layout(index) : distributedLayout(index);
    const rootEntities = layout.roots();
    result.name = resolveNameFrom(rootEntities) ?? projectName;
    for (const ent of rootEntities) {
      if (ent.location !== "Root") {
        continue;
      }
      if (ent.type === "Files") {
        result.files = readFiles(layout, ent);
      } else if (ent.type === "ProjectPath") {
        result.pathFolders = readPathFolders(layout, ent);
      } else if (ent.type === "Categories") {
        result.labels = readCategories(layout, ent);
      } else if (ent.type === "EntryPoints") {
        result.entryPoints = orderEntryPoints(readEntryPoints(layout, ent));
      } else if (ent.type === "EntryPointGroups") {
        result.entryPointGroups = readEntryPointGroups(layout, ent);
      } else if (ent.type === "WorkingFolders") {
        result.workingFolders = readWorkingFolders(layout, ent);
      }
    }
    for (const ent of rootEntities) {
      if (ent.type === "Reference") {
        const ref = resolveReference(ent);
        if (ref) {
          result.references.push(ref);
        }
        continue;
      }
      if (NOT_REFERENCE_COLLECTIONS.has(ent.type)) {
        continue;
      }
      for (const child of layout.children(ent)) {
        if (child.type === "Reference") {
          const ref = resolveReference(child);
          if (ref) {
            result.references.push(ref);
          }
        }
      }
    }
    result.files.sort((a, b) => a.path.localeCompare(b.path));
    result.pathFolders.sort((a, b) => a.localeCompare(b));
    return result;
  } catch (err2) {
    warnings.push({
      code: "source-unreadable",
      message: `The project store could not be read (${reasonOf(err2)}), so this project reads as empty.`
    });
    return emptyResult(projectName, warnings);
  }
}
function inferLayout(index) {
  for (const key of index.keys()) {
    if (key.startsWith("root/")) {
      return FIXED_PATH_V2;
    }
  }
  for (const key of index.keys()) {
    if (!key.includes("/") && key.includes(".type.")) {
      return DISTRIBUTED;
    }
  }
  return "";
}
function salvageName(index) {
  for (const [key, info] of index.entries()) {
    if (key === MANIFEST) {
      continue;
    }
    if (key.includes("ProjectData") && info["@_Name"]) {
      return info["@_Name"];
    }
  }
  return null;
}
function resolveNameFrom(rootEntities) {
  for (const ent of rootEntities) {
    if (ent.location === "ProjectData" && ent.type === "Info") {
      const name = ent.def?.["@_Name"];
      if (name) {
        return name;
      }
    }
  }
  for (const ent of rootEntities) {
    const name = ent.def?.["@_Name"];
    if (name && !ent.type) {
      return name;
    }
  }
  return null;
}
function parseInfo(content, relPath, warnings) {
  let doc;
  try {
    doc = readProjectXml(content);
  } catch (err2) {
    warnings.push({
      code: "part-unreadable",
      message: `Skipped an unreadable project entry (${reasonOf(err2)}).`,
      part: relPath
    });
    return null;
  }
  if (doc === null || typeof doc !== "object" || Object.keys(doc).length === 0) {
    warnings.push({
      code: "part-unreadable",
      message: "Skipped a project entry that contains no XML.",
      part: relPath
    });
    return null;
  }
  const info = doc.Info;
  if (info === void 0 || info === null) {
    return null;
  }
  if (typeof info !== "object") {
    return {};
  }
  return info;
}
function fixedPathV2Layout(index) {
  const readDir = (dir) => {
    if (!dir) {
      return [];
    }
    const prefix = dir + "/";
    const byHash = /* @__PURE__ */ new Map();
    for (const [relPath, info] of index.entries()) {
      if (!relPath.startsWith(prefix)) {
        continue;
      }
      const rest = relPath.slice(prefix.length);
      if (rest.includes("/")) {
        continue;
      }
      const parsed = parseChildName(rest);
      if (!parsed) {
        continue;
      }
      const { hash, isPointer } = parsed;
      let pair = byHash.get(hash);
      if (!pair) {
        pair = { pointer: null, def: null };
        byHash.set(hash, pair);
      }
      if (isPointer) {
        pair.pointer = info;
      } else {
        pair.def = info;
      }
    }
    return [...byHash.entries()].map(([hash, pair]) => ({
      dir: hash,
      location: pair.pointer?.["@_location"] ?? "",
      type: pair.pointer?.["@_type"] ?? "",
      def: pair.def
    }));
  };
  return { roots: () => readDir("root"), children: (e) => readDir(e.dir) };
}
function distributedLayout(index) {
  const readDir = (dir) => {
    const prefix = dir ? dir + "/" : "";
    const byStem = /* @__PURE__ */ new Map();
    for (const [relPath, info] of index.entries()) {
      if (!relPath.startsWith(prefix)) {
        continue;
      }
      const rest = relPath.slice(prefix.length);
      if (!rest) {
        continue;
      }
      const slash = rest.indexOf("/");
      if (slash === -1) {
        const stem = rest.slice(0, -".xml".length);
        if (!byStem.has(stem)) {
          byStem.set(stem, info);
        } else if (byStem.get(stem) === null) {
          byStem.set(stem, info);
        }
      } else {
        const stem = rest.slice(0, slash);
        if (!byStem.has(stem)) {
          byStem.set(stem, null);
        }
      }
    }
    const out = [];
    for (const [stem, def] of byStem) {
      const split = splitTypedName(stem);
      if (!split) {
        continue;
      }
      out.push({ dir: prefix + stem, location: split.location, type: split.type, def });
    }
    return out;
  };
  return { roots: () => readDir(""), children: (e) => readDir(e.dir) };
}
function splitTypedName(stem) {
  const marker = ".type.";
  const at = stem.lastIndexOf(marker);
  if (at <= 0) {
    return null;
  }
  const type = stem.slice(at + marker.length);
  if (!type || type.includes(".")) {
    return null;
  }
  return { location: stem.slice(0, at), type };
}
function parseChildName(name) {
  const stem = name.slice(0, -".xml".length);
  if (stem.endsWith("_sp")) {
    return { hash: stem.slice(0, -"_sp".length), isPointer: true };
  }
  if (stem.endsWith("_sd")) {
    return { hash: stem.slice(0, -"_sd".length), isPointer: false };
  }
  if (stem.endsWith("p")) {
    return { hash: stem.slice(0, -1), isPointer: true };
  }
  if (stem.endsWith("d")) {
    return { hash: stem.slice(0, -1), isPointer: false };
  }
  return null;
}
function readFiles(layout, collection) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const member of layout.children(collection)) {
    collectFile(layout, member, "", out, seen);
  }
  return out;
}
function collectFile(layout, entity, parentPath, out, seen) {
  if (entity.type !== "File") {
    return;
  }
  const name = entity.location;
  if (!name) {
    return;
  }
  const path = parentPath ? `${parentPath}/${name}` : name;
  if (seen.has(entity.dir)) {
    return;
  }
  seen.add(entity.dir);
  const children = layout.children(entity);
  let isFolder = false;
  const labels = [];
  const fileChildren = [];
  for (const child of children) {
    if (child.type === "DIR_SIGNIFIER") {
      isFolder = true;
    } else if (child.type === "File") {
      fileChildren.push(child);
    }
  }
  if (entity.def) {
    collectLabels(entity.def, labels);
  }
  out.push({ path, isFolder, labels: dedupe(labels) });
  for (const child of fileChildren) {
    collectFile(layout, child, path, out, seen);
  }
}
function collectLabels(def, into) {
  for (const category of toArray(def.Category)) {
    for (const label of toArray(category.Label)) {
      const uuid = label["@_UUID"];
      if (uuid) {
        into.push(uuid);
      }
    }
  }
}
function dedupe(arr) {
  return [...new Set(arr)];
}
function readPathFolders(layout, collection) {
  const out = [];
  for (const ent of layout.children(collection)) {
    if (ent.type !== "Reference") {
      continue;
    }
    const ref = ent.def?.["@_Ref"];
    if (ref !== void 0) {
      out.push(ref);
    }
  }
  return out;
}
function readCategories(layout, collection) {
  const out = [];
  for (const cat of layout.children(collection)) {
    if (cat.type !== "Category") {
      continue;
    }
    const categoryName = cat.def?.["@_Name"] || cat.location || "";
    for (const labelEnt of layout.children(cat)) {
      if (labelEnt.type !== "Label") {
        continue;
      }
      const id = labelEnt.location || "";
      const name = labelEnt.def?.["@_Name"] || id || "";
      if (name) {
        const ro = labelEnt.def?.["@_ReadOnly"];
        out.push({ id, category: categoryName, name, readOnly: ro !== void 0 && ro !== "0" });
      }
    }
  }
  return out;
}
function readEntryPoints(layout, collection) {
  const out = [];
  for (const ent of layout.children(collection)) {
    if (ent.type !== "EntryPoint") {
      continue;
    }
    const def = ent.def;
    const file = def?.["@_File"] ?? "";
    const name = def?.["@_Name"] ?? "";
    if (!file && !name) {
      continue;
    }
    const group = def?.["@_GroupUUID"] ?? "";
    out.push({
      id: ent.location,
      name: name || file,
      file,
      kind: def?.["@_Type"] ?? "",
      // Attribute values are never coerced by the reader, so this is the string
      // '1' or '0' (see XmlReader's contract) — not a number and not a boolean.
      visible: def?.["@_Visible"] !== "0",
      // 'default' is the store's spelling for "no group"; a caller grouping by this
      // field would otherwise render a group literally called default.
      groupId: group === "default" ? "" : group,
      prev: readPrev(def)
    });
  }
  return out;
}
function readPrev(def) {
  for (const ext of toArray(def?.Extension)) {
    const name = ext["@_Name"];
    if (name === "StartUpPrev" || name === "ShutdownPrev") {
      return ext["@_Value"] ?? "";
    }
  }
  return "";
}
function readEntryPointGroups(layout, collection) {
  const out = [];
  for (const ent of layout.children(collection)) {
    if (ent.type !== "EntryPointGroup") {
      continue;
    }
    const name = ent.def?.["@_Name"];
    if (name) {
      out.push({ id: ent.location, name });
    }
  }
  return out;
}
function readWorkingFolders(layout, collection) {
  const out = [];
  for (const ent of layout.children(collection)) {
    if (ent.type !== "Reference") {
      continue;
    }
    const ref = ent.def?.["@_Ref"];
    if (!ent.location || ref === void 0) {
      continue;
    }
    out.push({ key: ent.location, ref });
  }
  return out;
}
function orderEntryPoints(entries) {
  const out = [];
  const taken = /* @__PURE__ */ new Set();
  for (const kind of ["StartUp", "Shutdown"]) {
    const hook = entries.filter((e) => e.kind === kind);
    const byPrev = /* @__PURE__ */ new Map();
    for (const e of hook) {
      const list = byPrev.get(e.prev);
      if (list) {
        list.push(e);
      } else {
        byPrev.set(e.prev, [e]);
      }
    }
    let cursor = "HEAD";
    for (; ; ) {
      const step = (byPrev.get(cursor) ?? []).find((e) => !taken.has(e));
      if (!step) {
        break;
      }
      taken.add(step);
      out.push(step);
      cursor = step.id;
    }
    for (const e of hook) {
      if (!taken.has(e)) {
        taken.add(e);
        out.push(e);
      }
    }
  }
  for (const e of entries) {
    if (!taken.has(e)) {
      out.push(e);
    }
  }
  return out.map(({ prev: _prev, ...rest }) => rest);
}
function resolveReference(ent) {
  const ref = ent.def?.["@_Ref"];
  const id = ent.location || ref || "";
  if (!id) {
    return null;
  }
  let name = null;
  if (ref) {
    const parts = ref.split(/[/\\]/).filter((p) => p.length > 0);
    name = parts.length > 0 ? parts[parts.length - 1] : ref;
  }
  return { id, name, path: ref ?? null };
}

// node_modules/data-explorer-core/dist/datamodel/parser/BinarySlddSerializer.js
function serializeBinarySldd(slddNode) {
  const xmlString = buildDataChunkXml(slddNode);
  const encoder2 = new TextEncoder();
  const zipEntries = {};
  if (slddNode._zipMetadata) {
    for (const [name, data] of Object.entries(slddNode._zipMetadata)) {
      zipEntries[name] = data;
    }
  }
  zipEntries[DATA_PART_XML] = encoder2.encode(xmlString);
  const zipped = zipSync(zipEntries, { level: 6 });
  return zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength);
}
function buildDataChunkXml(slddNode) {
  const attrs = slddNode._dataSourceAttrs || { FormatVersion: "1", MinRelease: "R2014a", Arch: "" };
  const archAttr = attrs.Arch ? ' Arch="' + attrs.Arch + '"' : "";
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<DataSource FormatVersion="' + attrs.FormatVersion + '" MinRelease="' + attrs.MinRelease + '"' + archAttr + ">\n";
  slddNode.children.forEach(function(section) {
    section.children.forEach(function(entryNode) {
      xml += serializeEntryToXml(entryNode);
    });
  });
  for (const sub of slddNode.dictionaryReferences || []) {
    xml += '    <Object Class="DD.DICTIONARYREFERENCE">\n';
    xml += '        <P Name="Subdictionary" Class="char">' + escapeXml(String(sub)) + "</P>\n";
    xml += "    </Object>\n";
  }
  xml += '    <Object Class="DD.Dictionary">\n';
  xml += '        <P Name="AccessBaseWorkspace" Class="logical">' + (slddNode.allowAccessBWS ? "1" : "0") + "</P>\n";
  xml += "    </Object>\n";
  xml += "</DataSource>";
  return xml;
}
function serializeEntryToXml(entryNode) {
  const meta = entryNode.metadata || {};
  const lastMod = meta._rawLastMod || meta.lastmod || matlabTimestampNow();
  let xml = '    <Object Class="DD.ENTRY">\n';
  xml += '        <P Name="Name" Class="char">' + escapeXml(entryNode.name) + "</P>\n";
  xml += '        <P Name="UUID" Class="char">' + (meta.uuid || "") + "</P>\n";
  xml += '        <P Name="Namespace" Class="char">' + (meta.namespace || "") + "</P>\n";
  xml += '        <P Name="LastMod" Class="char">' + lastMod + "</P>\n";
  xml += '        <P Name="LastModBy" Class="char">' + escapeXml(meta.lastModifiedBy || "") + "</P>\n";
  xml += '        <P Name="IsDerived" Class="char">' + (meta.isderived || "0") + "</P>\n";
  xml += entryNode.serializeXml("P", { Name: "Value" }, 2) + "\n";
  xml += "    </Object>\n";
  return xml;
}

// node_modules/data-explorer-core/dist/datamodel/expressions.js
function identifiersIn(expression) {
  const pattern = /[A-Za-z_]\w*/g;
  const names = [];
  let match;
  while ((match = pattern.exec(expression)) !== null) {
    const before = match.index > 0 ? expression.charAt(match.index - 1) : "";
    if (before === "." || before >= "0" && before <= "9") {
      continue;
    }
    names.push(match[0]);
  }
  return names;
}

// node_modules/data-explorer-core/dist/datamodel/maskScope.js
function maskDefining(masks, systemPath, name) {
  let best;
  for (const mask of masks) {
    if (!mask.names.includes(name)) {
      continue;
    }
    if (!isInsideBlockPath(mask.blockPath, systemPath)) {
      continue;
    }
    if (!best || mask.blockPath.length > best.blockPath.length) {
      best = mask;
    }
  }
  return best;
}

// node_modules/data-explorer-core/dist/datamodel/node/RowCellPool.js
var NEVER_POOLED = "ID";
function keyOf(cell) {
  let key = "";
  for (const field of Object.keys(cell)) {
    const value = cell[field];
    let part;
    if (typeof value === "string") {
      part = "s" + value;
    } else if (typeof value === "boolean") {
      part = value ? "b1" : "b0";
    } else if (typeof value === "number") {
      part = "n" + value;
    } else if (value === void 0) {
      part = "u";
    } else if (value === null) {
      part = "z";
    } else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      part = "a";
      for (const item of value) {
        part += item.length + ":" + item;
      }
    } else {
      return null;
    }
    key += field.length + ":" + field + ":" + part.length + ":" + part;
  }
  return key;
}
var RowCellPool = class {
  constructor() {
    this.texts = /* @__PURE__ */ new Map();
    this.cells = /* @__PURE__ */ new Map();
  }
  /**
   * Replace every cell of `row` with this pool's instance of the same value, adopting the
   * row's own cells for the values it has not seen. Returns the same row, mutated in
   * place — the row object is freshly built by `toRow` and owned by nobody else yet.
   *
   * Called on the FINISHED row rather than woven into `toRow`'s branches on purpose: the
   * pooled and unpooled paths then cannot produce different VALUES, because there is only
   * one path that produces values. The cost is that a duplicate cell is allocated before
   * it is discarded, which buys back nothing in peak memory but is garbage that dies in
   * the nursery.
   *
   * Idempotent, so a subclass that rewrites a cell after `super.toRow()` may share again.
   */
  share(row) {
    const cells = row;
    for (const column of Object.keys(cells)) {
      if (column === NEVER_POOLED) {
        continue;
      }
      const value = cells[column];
      if (typeof value === "string") {
        const seen = this.texts.get(value);
        if (seen === void 0) {
          this.texts.set(value, value);
        } else {
          cells[column] = seen;
        }
      } else if (value !== null && typeof value === "object") {
        const key = keyOf(value);
        if (key === null) {
          continue;
        }
        const seen = this.cells.get(key);
        if (seen === void 0) {
          this.cells.set(key, Object.freeze(value));
        } else {
          cells[column] = seen;
        }
      }
    }
    return row;
  }
  /** Distinct values held, string and object cells together. For tests and probes. */
  get size() {
    return this.texts.size + this.cells.size;
  }
};

// node_modules/data-explorer-core/dist/core/findQuery.js
function isAsked(field) {
  return field !== void 0 && field !== "";
}
function textCriterion(read, test) {
  return (node) => {
    let text;
    try {
      text = read(node);
    } catch {
      return false;
    }
    return typeof text === "string" && test(text);
  };
}
function compileTextTest(pattern, caseSensitive, whole) {
  if (typeof pattern !== "string") {
    if (pattern.global || pattern.sticky) {
      const stateless = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""));
      return (text) => stateless.test(text);
    }
    return (text) => pattern.test(text);
  }
  if (caseSensitive) {
    return whole ? (text) => text === pattern : (text) => text.includes(pattern);
  }
  const folded = pattern.toLowerCase();
  return whole ? (text) => text.toLowerCase() === folded : (text) => text.toLowerCase().includes(folded);
}
function compileCriteria(query) {
  const caseSensitive = query.caseSensitive === true;
  const criteria = [];
  if (isAsked(query.className)) {
    criteria.push(textCriterion((node) => node.className, compileTextTest(query.className, caseSensitive, true)));
  }
  if (isAsked(query.kind)) {
    criteria.push(textCriterion((node) => node.kind, compileTextTest(query.kind, caseSensitive, true)));
  }
  if (isAsked(query.name)) {
    criteria.push(textCriterion((node) => node.name, compileTextTest(query.name, caseSensitive, false)));
  }
  if (isAsked(query.value)) {
    criteria.push(textCriterion((node) => node.displayValue, compileTextTest(query.value, caseSensitive, false)));
  }
  return criteria;
}

// node_modules/data-explorer-core/dist/core/typeLinkIndex.js
var TYPE_DEFINING_CLASSES = /* @__PURE__ */ new Set([
  "Simulink.AliasType",
  "Simulink.NumericType",
  "Simulink.data.dictionary.EnumTypeDefinition",
  "Simulink.Bus",
  "Simulink.ValueType"
]);
function buildTypeLinkIndex(source) {
  const names = /* @__PURE__ */ new Set();
  const add = (node) => {
    if (node && node.isEntry === true && typeof node.name === "string" && node.name !== "" && TYPE_DEFINING_CLASSES.has(node.className)) {
      names.add(node.name);
    }
  };
  const childrenOf = (node) => node && Array.isArray(node.children) ? node.children : [];
  for (const child of childrenOf(source)) {
    add(child);
    for (const grandchild of childrenOf(child)) {
      add(grandchild);
    }
  }
  return names;
}
function typeLinkIndexOf(source) {
  const cached = source._typeLinkIndex;
  if (cached) {
    return cached;
  }
  const built = buildTypeLinkIndex(source);
  source._typeLinkIndex = built;
  return built;
}
function typeLinkTargetIn(source, srcId, typeName) {
  if (typeof typeName !== "string" || typeName === "") {
    return null;
  }
  return typeLinkIndexOf(source).has(typeName) ? `${typeName}@${srcId}` : null;
}

// node_modules/data-explorer-core/dist/core/DataModel.js
function splitLinkTarget(target) {
  const at = target.indexOf("@");
  if (at < 0) {
    return { name: null, source: target };
  }
  return { name: target.slice(0, at), source: target.slice(at + 1) };
}
function createSession(opts = {}) {
  const bus = opts.bus ?? createEventBus();
  const UndoManager = createUndoManager(bus);
  const { publish: publish2, subscribe: subscribe2 } = bus;
  const allNode = {
    __isAllNode: true,
    isContainer: true,
    name: "__all__",
    displayName: "Root",
    icon: "abstractClass",
    parent: null,
    id: "__all__"
  };
  const dataSources = /* @__PURE__ */ new Map();
  const nodeIndex = /* @__PURE__ */ new Map();
  let contextNode = null;
  let entryNodes = [];
  let previewNode = null;
  let batchDepth = 0;
  let usageBatch = null;
  function buildMeta(meta) {
    return {
      path: meta && meta.path || "",
      lastModified: meta && meta.lastModified || null,
      size: meta && meta.size || 0,
      fileHandle: meta && meta.fileHandle || null
    };
  }
  function registerSource(srcId, sourceNode, meta, warnings) {
    sourceNode.meta = buildMeta(meta);
    if (warnings && warnings.length > 0) {
      sourceNode.warnings = warnings;
    }
    sourceNode._usageResolver = usagesForRow;
    sourceNode._typeLinkResolver = (typeName) => typeLinkTargetIn(sourceNode, srcId, typeName);
    const previous = dataSources.get(srcId);
    if (previous) {
      deindexSource(previous);
    }
    dataSources.set(srcId, sourceNode);
    indexSource(sourceNode);
    publish2("datamodel/source-added", { srcId, slddNode: sourceNode });
    return sourceNode;
  }
  function indexSource(source) {
    const flat = source.flatten();
    for (let i = 0; i < flat.length; i++) {
      nodeIndex.set(flat[i].id, flat[i]);
    }
  }
  function deindexSource(source) {
    const flat = source.flatten();
    for (let i = 0; i < flat.length; i++) {
      nodeIndex.delete(flat[i].id);
    }
  }
  function mutateSubtree(root, mutate) {
    const before = root.flatten();
    const staleIds = [];
    for (let i = 0; i < before.length; i++) {
      staleIds.push(before[i].id);
    }
    try {
      return mutate();
    } finally {
      for (let i = 0; i < staleIds.length; i++) {
        nodeIndex.delete(staleIds[i]);
      }
      const after = root.flatten();
      for (let i = 0; i < after.length; i++) {
        nodeIndex.set(after[i].id, after[i]);
      }
      const survivors = new Set(after);
      releaseSubtreeSelection(before.filter((n) => !survivors.has(n)));
    }
  }
  function indexSubtree(root) {
    const flat = root.flatten();
    for (let i = 0; i < flat.length; i++) {
      nodeIndex.set(flat[i].id, flat[i]);
    }
  }
  function unindexSubtree(root, detach) {
    const flat = root.flatten();
    const ids = [];
    for (let i = 0; i < flat.length; i++) {
      ids.push(flat[i].id);
    }
    try {
      detach?.();
    } finally {
      for (let i = 0; i < ids.length; i++) {
        nodeIndex.delete(ids[i]);
      }
      releaseSubtreeSelection(flat);
    }
  }
  function beginBatch() {
    batchDepth++;
  }
  function endBatch() {
    if (batchDepth > 0) {
      batchDepth--;
    }
    if (batchDepth === 0) {
      publish2("active/changed");
    }
  }
  function publishActiveChanged() {
    if (batchDepth === 0) {
      publish2("active/changed");
    }
  }
  function setActiveContext(node) {
    contextNode = node;
    entryNodes = [];
    publishActiveChanged();
  }
  function setActiveEntry(nodes) {
    if (nodes === null) {
      entryNodes = [];
    } else if (Array.isArray(nodes)) {
      entryNodes = nodes;
    } else {
      entryNodes = [nodes];
    }
    publishActiveChanged();
  }
  function setActive(context, entry) {
    contextNode = context;
    if (entry === null) {
      entryNodes = [];
    } else if (Array.isArray(entry)) {
      entryNodes = entry;
    } else {
      entryNodes = [entry];
    }
    publishActiveChanged();
  }
  function getContextNode() {
    return contextNode;
  }
  function getEntryNode() {
    return entryNodes.length > 0 ? entryNodes[0] : null;
  }
  function getEntryNodes() {
    return entryNodes;
  }
  function getActiveNode() {
    return entryNodes.length > 0 ? entryNodes[0] : contextNode;
  }
  function addDataSource(srcId, content, meta, warnings) {
    const collected = warnings || [];
    const slddNode = SlddNode.parse(content, srcId, collected);
    return registerSource(srcId, slddNode, meta, collected);
  }
  function addParsedSource(srcId, slddNode, meta, warnings) {
    return registerSource(srcId, slddNode, meta, warnings);
  }
  function addModelSource(srcId, buffer, meta) {
    const parsed = parseModel(buffer, srcId);
    const modelNode = ModelNode.fromParsed(parsed, srcId);
    return registerSource(srcId, modelNode, meta, parsed.warnings);
  }
  function addMatSource(srcId, buffer, meta) {
    const parsed = parseMat(buffer);
    const matNode = MatNode.fromParsed(parsed, srcId);
    return registerSource(srcId, matNode, meta, parsed.warnings);
  }
  function addProjectSource(srcId, files, meta) {
    const basename = basenameOf(meta && meta.path || srcId);
    const parsed = parseProject(files, projectNameOf(basename));
    const projectNode = ProjectNode.fromParsed(parsed, basename);
    return registerSource(srcId, projectNode, meta, parsed.warnings);
  }
  function addModelSourceParsed(srcId, parsed, meta) {
    const result = parsed;
    const modelNode = ModelNode.fromParsed(result, srcId);
    return registerSource(srcId, modelNode, meta, result.warnings);
  }
  function addMatSourceParsed(srcId, parsed, meta) {
    const result = parsed;
    const matNode = MatNode.fromParsed(result, srcId);
    return registerSource(srcId, matNode, meta, result.warnings);
  }
  function ownerSourceOf(node) {
    if (!node || "__isAllNode" in node && node.__isAllNode) {
      return null;
    }
    let cur = node;
    while (cur.parent) {
      cur = cur.parent;
    }
    return cur;
  }
  function releaseSelection(source) {
    let activeChanged = false;
    if (contextNode && (source === null || ownerSourceOf(contextNode) === source)) {
      contextNode = null;
      activeChanged = true;
    }
    if (entryNodes.length > 0) {
      const kept = source === null ? [] : entryNodes.filter((n) => ownerSourceOf(n) !== source);
      if (kept.length !== entryNodes.length) {
        entryNodes = kept;
        activeChanged = true;
      }
    }
    if (previewNode && (source === null || ownerSourceOf(previewNode) === source)) {
      previewNode = null;
      publish2("preview/changed");
    }
    if (activeChanged) {
      publishActiveChanged();
    }
  }
  function releaseSubtreeSelection(subtree) {
    if (subtree.length === 0) {
      return;
    }
    const removed = new Set(subtree);
    let activeChanged = false;
    if (contextNode && !("__isAllNode" in contextNode) && removed.has(contextNode)) {
      contextNode = null;
      activeChanged = true;
    }
    if (entryNodes.length > 0) {
      const kept = entryNodes.filter((n) => !removed.has(n));
      if (kept.length !== entryNodes.length) {
        entryNodes = kept;
        activeChanged = true;
      }
    }
    if (previewNode && removed.has(previewNode)) {
      previewNode = null;
      publish2("preview/changed");
    }
    if (activeChanged) {
      publishActiveChanged();
    }
  }
  function removeDataSource(srcId) {
    const source = dataSources.get(srcId);
    if (!source) {
      return;
    }
    deindexSource(source);
    dataSources.delete(srcId);
    releaseSelection(source);
    publish2("datamodel/source-removed", { srcId });
  }
  function removeAll() {
    dataSources.clear();
    nodeIndex.clear();
    publish2("datamodel/cleared");
    releaseSelection(null);
  }
  function getDataSource(srcId) {
    return dataSources.get(srcId) || null;
  }
  function hasDataSource(srcId) {
    return dataSources.has(srcId);
  }
  function getDataSourceIds() {
    return Array.from(dataSources.keys());
  }
  function getDataSourceCount() {
    return dataSources.size;
  }
  function isBatching() {
    return batchDepth > 0;
  }
  function findNodeById(nodeId) {
    return nodeIndex.get(nodeId) || null;
  }
  function findNodes(query) {
    const criteria = compileCriteria(query);
    if (criteria.length === 0) {
      return [];
    }
    const limit = query.limit === void 0 ? Infinity : query.limit;
    if (limit < 1) {
      return [];
    }
    let scope = null;
    if (query.sourceId !== void 0) {
      const source = dataSources.get(query.sourceId);
      if (!source) {
        return [];
      }
      scope = source;
    }
    const found = [];
    for (const node of nodeIndex.values()) {
      if (scope && ownerSourceOf(node) !== scope) {
        continue;
      }
      let matched = true;
      for (let i = 0; i < criteria.length; i++) {
        if (!criteria[i](node)) {
          matched = false;
          break;
        }
      }
      if (!matched) {
        continue;
      }
      found.push(node);
      if (found.length >= limit) {
        break;
      }
    }
    return found;
  }
  function findNode(query) {
    const found = findNodes({ ...query, limit: 1 });
    return found.length > 0 ? found[0] : null;
  }
  function srcIdOf(source) {
    if (!source) {
      return null;
    }
    for (const [srcId, candidate] of dataSources) {
      if (candidate === source) {
        return srcId;
      }
    }
    return null;
  }
  function openSourceNamed(name) {
    if (!name) {
      return null;
    }
    const stem = modelNameOf(name);
    const key = refBasename(name);
    const stemKey = stem === null ? null : stem.toLowerCase();
    let best = null;
    for (const [srcId, source] of dataSources) {
      const path = source.meta && typeof source.meta.path === "string" ? source.meta.path : "";
      let rank = 0;
      if (srcId === name) {
        rank = 4;
      } else if (refBasename(srcId) === key) {
        rank = 3;
      } else if (path !== "" && refBasename(path) === key) {
        rank = 2;
      } else if (stemKey !== null) {
        const candidateStem = modelNameOf(basenameOf(srcId)) ?? (path !== "" ? modelNameOf(basenameOf(path)) : null);
        if (candidateStem !== null && candidateStem.toLowerCase() === stemKey) {
          rank = 1;
        }
      }
      if (rank > 0 && (best === null || rank > best.rank)) {
        best = { rank, srcId, source };
      }
    }
    return best === null ? null : { srcId: best.srcId, source: best.source };
  }
  function entriesNamed(srcId, name) {
    const candidates = findNodes({ name, sourceId: srcId, caseSensitive: true });
    return candidates.filter((node) => node.name === name && node.isEntry === true);
  }
  function blockWithKey(srcId, key) {
    const source = dataSources.get(srcId);
    const section = source && typeof source.getSection === "function" ? source.getSection("blocks") : null;
    if (!section || !Array.isArray(section.children)) {
      return null;
    }
    for (const child of section.children) {
      const sid = child.sid;
      if (blockKey(child.name, typeof sid === "string" ? sid : "") === key) {
        return child;
      }
    }
    return null;
  }
  function resolveLink(target) {
    if (typeof target !== "string" || target.trim() === "") {
      return { status: "empty" };
    }
    const { name, source } = splitLinkTarget(target);
    const open = openSourceNamed(source);
    if (open === null) {
      return { status: "source-not-open", sourceId: source, name };
    }
    if (name === null) {
      const root = open.source;
      return { status: "resolved", sourceId: open.srcId, node: root, nodes: [root] };
    }
    const found = [];
    for (const identifier of identifiersIn(name)) {
      for (const node of entriesNamed(open.srcId, identifier)) {
        if (!found.includes(node)) {
          found.push(node);
        }
      }
    }
    if (found.length === 0) {
      const block = blockWithKey(open.srcId, name);
      if (block !== null) {
        return { status: "resolved", sourceId: open.srcId, node: block, nodes: [block] };
      }
      return { status: "not-found", sourceId: open.srcId, name };
    }
    return { status: "resolved", sourceId: open.srcId, node: found[0], nodes: found };
  }
  function dictionaryRefNamesOf(srcId) {
    const source = dataSources.get(srcId);
    if (!source) {
      return [];
    }
    return normalizeRefNames(source.dictionaryReferences);
  }
  function resolutionOrder(model, modelSrcId) {
    const order = [modelSrcId];
    const declared = typeof model.getSection === "function" ? model.getSection("dataSources") : null;
    const children = declared && Array.isArray(declared.children) ? declared.children : [];
    const dictionaries = [];
    const mats = [];
    for (const child of children) {
      const name = child && typeof child.name === "string" ? child.name : "";
      if (isSlddFile(name)) {
        dictionaries.push(name);
      } else if (isMatFile(name)) {
        mats.push(name);
      }
    }
    const seen = /* @__PURE__ */ new Set();
    while (dictionaries.length > 0) {
      const ref = dictionaries.shift();
      const key = refBasename(ref);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const open = openSourceNamed(ref);
      if (open === null) {
        continue;
      }
      order.push(open.srcId);
      dictionaries.push(...dictionaryRefNamesOf(open.srcId));
    }
    for (const ref of mats) {
      const open = openSourceNamed(ref);
      if (open !== null) {
        order.push(open.srcId);
      }
    }
    return order;
  }
  function definedNamesOf(srcId, asModel) {
    const names = /* @__PURE__ */ new Set();
    const source = dataSources.get(srcId);
    if (!source) {
      return names;
    }
    const add = (node) => {
      if (node && node.isEntry === true && typeof node.name === "string" && node.name !== "") {
        names.add(node.name);
      }
    };
    const childrenOf = (node) => node && Array.isArray(node.children) ? node.children : [];
    if (asModel) {
      const workspace = typeof source.getSection === "function" ? source.getSection("workspace") : null;
      for (const child of childrenOf(workspace)) {
        add(child);
      }
      return names;
    }
    for (const child of childrenOf(source)) {
      add(child);
      for (const grandchild of childrenOf(child)) {
        add(grandchild);
      }
    }
    return names;
  }
  function definitionRank(model, definition, owner, definitionSrcId, rankOf) {
    if (model === owner) {
      const parent = definition.parent;
      return parent !== null && parent.name === "workspace" ? 0 : null;
    }
    const rank = rankOf.get(definitionSrcId);
    return rank === void 0 ? null : rank;
  }
  function findUsages(nodeId) {
    const definition = nodeIndex.get(nodeId);
    if (!definition) {
      return [];
    }
    return collectUsages([definition]).get(nodeId) ?? [];
  }
  function collectUsages(definitions) {
    const result = /* @__PURE__ */ new Map();
    const byName = /* @__PURE__ */ new Map();
    for (const definition of definitions) {
      if (!definition || definition.isEntry !== true || !definition.name) {
        continue;
      }
      const owner = ownerSourceOf(definition);
      const srcId = srcIdOf(owner);
      if (srcId === null) {
        continue;
      }
      const usages = [];
      result.set(definition.id, usages);
      const named = byName.get(definition.name);
      if (named) {
        named.push({ node: definition, owner, srcId, usages });
      } else {
        byName.set(definition.name, [{ node: definition, owner, srcId, usages }]);
      }
    }
    if (byName.size === 0) {
      return result;
    }
    for (const [srcId, source] of dataSources) {
      const declared = source.blockParamUsages;
      if (!Array.isArray(declared)) {
        continue;
      }
      const declaredMasks = source.masks;
      const masks = Array.isArray(declaredMasks) ? declaredMasks.filter((mask) => mask && Array.isArray(mask.names) && typeof mask.blockPath === "string") : [];
      const ranked = [];
      const rankOf = /* @__PURE__ */ new Map();
      for (const id of resolutionOrder(source, srcId)) {
        if (!rankOf.has(id)) {
          rankOf.set(id, ranked.length);
          ranked.push(id);
        }
      }
      const definedAt = ranked.map(() => null);
      const namesAt = (i) => {
        const known = definedAt[i];
        if (known !== null) {
          return known;
        }
        const built = definedNamesOf(ranked[i], i === 0);
        definedAt[i] = built;
        return built;
      };
      const visible = /* @__PURE__ */ new Map();
      for (const [name, defs] of byName) {
        let resolved = -1;
        for (let i = 0; i < ranked.length; i++) {
          if (namesAt(i).has(name)) {
            resolved = i;
            break;
          }
        }
        if (resolved === -1) {
          continue;
        }
        const winners = defs.filter((def) => definitionRank(source, def.node, def.owner, def.srcId, rankOf) === resolved);
        if (winners.length > 0) {
          visible.set(name, winners);
        }
      }
      if (visible.size === 0) {
        continue;
      }
      for (const raw of declared) {
        const usage = raw;
        if (!usage || typeof usage.paramValue !== "string" || typeof usage.blockName !== "string") {
          continue;
        }
        const sid = typeof usage.sid === "string" ? usage.sid : "";
        const systemPath = typeof usage.systemPath === "string" ? usage.systemPath : "";
        for (const identifier of new Set(identifiersIn(usage.paramValue))) {
          const targets = visible.get(identifier);
          if (!targets) {
            continue;
          }
          if (maskDefining(masks, systemPath, identifier)) {
            continue;
          }
          for (const target of targets) {
            target.usages.push({
              // What the block READS as, which for a block whose label a user cleared is
              // `<SID: 65>` and not '' — a cell with a link in it has to have text. See
              // blockIdentity.
              blockName: blockLabel(usage.blockName, sid),
              // The same join UsageIndex makes, from the same two fields, so the two
              // engines that fill this cell agree about where a block is as well as about
              // which blocks there are — see test/usageEngines.test.ts.
              blockPath: joinBlockPath(systemPath, blockLabel(usage.blockName, sid)),
              blockType: typeof usage.blockType === "string" ? usage.blockType : "",
              paramProperty: typeof usage.paramProperty === "string" ? usage.paramProperty : "",
              paramValue: usage.paramValue,
              modelSrcId: srcId,
              // The forward grammar, reversed: an entry of the model named by the model. See
              // NodeUsage for why this and not a second target format. The name part is the
              // block's KEY rather than its label, because two blocks in one model can share
              // a label and a link has to reach the one that holds the parameter.
              linkTarget: blockKey(usage.blockName, sid) + "@" + srcId
            });
          }
        }
      }
    }
    return result;
  }
  function usagesForRow(nodeId) {
    if (usageBatch !== null) {
      return usageBatch.get(nodeId) ?? [];
    }
    return findUsages(nodeId);
  }
  function rowsOf(container) {
    const nodes = container && typeof container.flatten === "function" ? container.flatten() : [];
    const previous = usageBatch;
    usageBatch = collectUsages(nodes);
    const pool = new RowCellPool();
    try {
      const rows = [];
      for (const node of nodes) {
        const row = node.toRow(pool);
        if (row !== null) {
          rows.push(row);
        }
      }
      return rows;
    } finally {
      usageBatch = previous;
    }
  }
  function resolveDictionaryReferences(srcId) {
    return dictionaryRefNamesOf(srcId).map((name) => ({ name, resolution: resolveLink(name) }));
  }
  function reindexAll() {
    nodeIndex.clear();
    dataSources.forEach((src) => indexSource(src));
  }
  subscribe2("node/added", reindexAll);
  subscribe2("node/deleted", reindexAll);
  subscribe2("node/children-changed", reindexAll);
  function readPropertyValue(node, propertyName, fallback) {
    try {
      const props = node.getProperties();
      for (let i = 0; i < props.length; i++) {
        const key = props[i].key;
        const column = props[i].column;
        if (key === propertyName || column === propertyName) {
          return node.getPropInfo(props[i]).displayValue;
        }
      }
    } catch {
    }
    return fallback;
  }
  function editProperty(nodeId, propertyName, newValue, oldValue) {
    const activeNode = getActiveNode();
    if (!activeNode || activeNode.id !== nodeId) {
      return false;
    }
    if ("__isAllNode" in activeNode) {
      return false;
    }
    const node = activeNode;
    if (!node.setProperty) {
      return false;
    }
    const priorValue = readPropertyValue(node, propertyName, oldValue);
    const result = node.setProperty(propertyName, newValue);
    if (result !== true) {
      return result || false;
    }
    const slddNode = getActiveSlddNode();
    const kind = propertyName === "Name" ? "rename" : "property";
    if (slddNode) {
      const cmd = {
        execute() {
          node.setProperty(propertyName, newValue);
          publish2("node/edited", { source: "undo", nodeId: node.id, kind });
          if (kind === "rename") {
            publishActiveChanged();
          }
          publish2("node/children-changed", { parent: node });
        },
        undo() {
          node.setProperty(propertyName, priorValue);
          publish2("node/edited", { source: "undo", nodeId: node.id, kind });
          if (kind === "rename") {
            publishActiveChanged();
          }
          publish2("node/children-changed", { parent: node });
        }
      };
      UndoManager.pushExecuted(slddNode.name, cmd);
    }
    publish2("node/edited", { source: "pi", nodeId: node.id, kind });
    if (kind === "rename") {
      publishActiveChanged();
    }
    publish2("node/children-changed", { parent: node });
    return true;
  }
  function addEntry(sectionKey, className, entryName) {
    const slddNode = getActiveSlddNode();
    if (!slddNode) {
      return null;
    }
    let section = slddNode.getSection(sectionKey);
    if (!section) {
      for (const child of slddNode.children) {
        const sec = child;
        if (sec.getAllowedTypes && sec.getAllowedTypes().includes(className)) {
          section = sec;
          break;
        }
      }
      if (!section) {
        return null;
      }
    }
    if (!section.execAddEntry) {
      return null;
    }
    const result = section.execAddEntry(className, entryName);
    if (!result) {
      return null;
    }
    const srcId = slddNode.name;
    const node = result.node;
    const sectionRef = section;
    UndoManager.pushExecuted(srcId, {
      execute() {
        result.redo();
        nodeIndex.set(node.id, node);
        setActiveEntry(node);
        publish2("node/added", { node, sectionKey: sectionRef.name });
      },
      undo() {
        result.undo();
        nodeIndex.delete(node.id);
        setActiveEntry(null);
        publish2("node/deleted", { node, section: sectionRef });
      }
    });
    nodeIndex.set(node.id, node);
    publish2("node/added", { node, sectionKey: section.name });
    setActiveEntry(node);
    return node;
  }
  function selectAfterRemoval(policy, removed, next) {
    if (policy === "follow") {
      setActiveEntry(next);
      return;
    }
    releaseSubtreeSelection(removed);
  }
  function addChildOfNode(node, scope, policy) {
    if (!node.execAddChild) {
      return null;
    }
    const rawResult = node.execAddChild();
    if (!rawResult) {
      return null;
    }
    const result = rawResult;
    const child = result.node;
    if (scope) {
      UndoManager.pushExecuted(scope.name, {
        execute() {
          result.redo();
          nodeIndex.set(child.id, child);
          if (policy === "follow") {
            setActiveEntry(child);
          }
          publish2("node/children-changed", { parent: node });
        },
        undo() {
          const removed = policy === "follow" ? [] : child.flatten();
          result.undo();
          nodeIndex.delete(child.id);
          selectAfterRemoval(policy, removed, node);
          publish2("node/children-changed", { parent: node });
        }
      });
    }
    nodeIndex.set(child.id, child);
    publish2("node/children-changed", { parent: node });
    return child;
  }
  function deleteOneNode(node, scope, policy) {
    if (node.isEntry) {
      const section = node.parent;
      if (!section || !section.execRemoveEntry) {
        return false;
      }
      const nodeId2 = node.id;
      const removed2 = policy === "follow" ? [] : node.flatten();
      const result2 = section.execRemoveEntry(node);
      if (!result2) {
        return false;
      }
      UndoManager.pushExecuted(scope.name, {
        execute() {
          const currentId = node.id;
          const redoRemoved = policy === "follow" ? [] : node.flatten();
          result2.redo();
          nodeIndex.delete(currentId);
          selectAfterRemoval(policy, redoRemoved, null);
          publish2("node/deleted", { node, section });
        },
        undo() {
          result2.undo();
          nodeIndex.set(node.id, node);
          if (policy === "follow") {
            setActiveEntry(node);
          }
          publish2("node/added", { node, sectionKey: section.name });
        }
      });
      nodeIndex.delete(nodeId2);
      selectAfterRemoval(policy, removed2, null);
      publish2("node/deleted", { node, section });
      return true;
    }
    const parent = node.parent;
    if (!parent || !parent.execRemoveChild) {
      return false;
    }
    const nodeId = node.id;
    const removed = policy === "follow" ? [] : node.flatten();
    const rawResult = parent.execRemoveChild(node);
    if (!rawResult) {
      return false;
    }
    const result = rawResult;
    UndoManager.pushExecuted(scope.name, {
      execute() {
        const currentId = node.id;
        const redoRemoved = policy === "follow" ? [] : node.flatten();
        result.redo();
        nodeIndex.delete(currentId);
        selectAfterRemoval(policy, redoRemoved, parent);
        publish2("node/children-changed", { parent });
      },
      undo() {
        result.undo();
        nodeIndex.set(node.id, node);
        if (policy === "follow") {
          setActiveEntry(node);
        }
        publish2("node/children-changed", { parent });
      }
    });
    nodeIndex.delete(nodeId);
    selectAfterRemoval(policy, removed, parent);
    publish2("node/children-changed", { parent });
    return true;
  }
  function deleteEntryBatch(nodes, scope, policy) {
    const undoInfo = [];
    const removed = [];
    for (const node of nodes) {
      if (!node.isEntry)
        continue;
      const section = node.parent;
      if (!section || !section.execRemoveEntry)
        continue;
      const nodeId = node.id;
      const subtree = policy === "follow" ? [] : node.flatten();
      const result = section.execRemoveEntry(node);
      if (result) {
        undoInfo.push({ node, nodeId, section, result });
        removed.push(...subtree);
      }
    }
    if (undoInfo.length === 0) {
      return false;
    }
    UndoManager.pushExecuted(scope.name, {
      execute() {
        const redoRemoved = [];
        for (const info of undoInfo) {
          const currentId = info.node.id;
          if (policy !== "follow") {
            redoRemoved.push(...info.node.flatten());
          }
          info.result.redo();
          nodeIndex.delete(currentId);
        }
        selectAfterRemoval(policy, redoRemoved, null);
        publish2("node/deleted", { node: undoInfo[0].node, section: undoInfo[0].section });
      },
      undo() {
        for (let i = undoInfo.length - 1; i >= 0; i--) {
          undoInfo[i].result.undo();
          nodeIndex.set(undoInfo[i].node.id, undoInfo[i].node);
        }
        if (policy === "follow") {
          setActiveEntry(undoInfo.map((info) => info.node));
        }
        publish2("node/added", { node: undoInfo[0].node, sectionKey: undoInfo[0].section.name });
      }
    });
    for (const info of undoInfo) {
      nodeIndex.delete(info.nodeId);
    }
    selectAfterRemoval(policy, removed, null);
    publish2("node/deleted", { node: undoInfo[0].node, section: undoInfo[0].section });
    return true;
  }
  function addChild2() {
    const node = entryNodes.length === 1 ? entryNodes[0] : null;
    if (!node) {
      return null;
    }
    return addChildOfNode(node, getActiveSlddNode(), "follow");
  }
  function addChildTo(nodeId) {
    const node = nodeIndex.get(nodeId);
    if (!node) {
      return null;
    }
    return addChildOfNode(node, editableOwnerOf(node), "keep");
  }
  function deleteNode() {
    const nodes = getEntryNodes();
    if (nodes.length === 0) {
      return false;
    }
    const slddNode = getActiveSlddNode();
    if (!slddNode) {
      return false;
    }
    if (nodes.length === 1) {
      return deleteOneNode(nodes[0], slddNode, "follow");
    }
    return deleteEntryBatch(nodes, slddNode, "follow");
  }
  function deleteNodeById(nodeId) {
    const node = nodeIndex.get(nodeId);
    if (!node) {
      return false;
    }
    const scope = editableOwnerOf(node);
    if (!scope) {
      return false;
    }
    return deleteOneNode(node, scope, "keep");
  }
  function deleteNodesById(nodeIds) {
    const nodes = [];
    for (const id of nodeIds) {
      const node = nodeIndex.get(id);
      if (node) {
        nodes.push(node);
      }
    }
    if (nodes.length === 0) {
      return false;
    }
    const scope = editableOwnerOf(nodes[0]);
    if (!scope) {
      return false;
    }
    for (const node of nodes) {
      if (editableOwnerOf(node) !== scope) {
        return false;
      }
    }
    if (nodes.length === 1) {
      return deleteOneNode(nodes[0], scope, "keep");
    }
    return deleteEntryBatch(nodes, scope, "keep");
  }
  function undoAction() {
    const slddNode = getActiveSlddNode();
    if (!slddNode) {
      return;
    }
    UndoManager.undo(slddNode.name);
  }
  function redoAction() {
    const slddNode = getActiveSlddNode();
    if (!slddNode) {
      return;
    }
    UndoManager.redo(slddNode.name);
  }
  function canUndoActive() {
    const slddNode = getActiveSlddNode();
    return slddNode ? UndoManager.canUndo(slddNode.name) : false;
  }
  function canRedoActive() {
    const slddNode = getActiveSlddNode();
    return slddNode ? UndoManager.canRedo(slddNode.name) : false;
  }
  function setPreviewNode(node) {
    previewNode = node;
    publish2("preview/changed");
  }
  function getPreviewNode() {
    return previewNode;
  }
  function clearPreviewNode() {
    if (previewNode !== null) {
      previewNode = null;
      publish2("preview/changed");
    }
  }
  function editableOwnerOf(node) {
    const root = ownerSourceOf(node);
    if (!root) {
      return null;
    }
    return root.dirty !== void 0 ? root : null;
  }
  function getActiveSlddNode() {
    return editableOwnerOf(contextNode);
  }
  function serializeSource(srcId) {
    const source = dataSources.get(srcId);
    if (!source) {
      return null;
    }
    if (!(source instanceof SlddNode)) {
      return null;
    }
    if (source.sourceFormat === "xml") {
      const zipped = serializeBinarySldd(source);
      return { kind: "binary", sourceFormat: source.sourceFormat, bytes: new Uint8Array(zipped) };
    }
    return {
      kind: "text",
      sourceFormat: source.sourceFormat,
      text: JSON.stringify(source.serializeJson(), null, "	")
    };
  }
  function getActiveSourceNode() {
    return ownerSourceOf(contextNode);
  }
  const session = {
    allNode,
    addDataSource,
    addParsedSource,
    addModelSource,
    addModelSourceParsed,
    addMatSource,
    addMatSourceParsed,
    addProjectSource,
    removeDataSource,
    removeAll,
    getDataSource,
    hasDataSource,
    getDataSourceIds,
    getDataSourceCount,
    serializeSource,
    isBatching,
    setActiveContext,
    setActiveEntry,
    setActive,
    getContextNode,
    getEntryNode,
    getEntryNodes,
    getActiveNode,
    getActiveSlddNode,
    getActiveSourceNode,
    setPreviewNode,
    getPreviewNode,
    clearPreviewNode,
    findNodeById,
    // The search surface beside the single-id lookup: findNodes for a result set,
    // findNode for the first match. Both read the same index findNodeById reads.
    findNodes,
    findNode,
    // Link resolution, both directions, over the same index: resolveLink follows a
    // `linkTarget` a node published, findUsages answers the reverse for a definition,
    // and resolveDictionaryReferences does the same for the one link that never
    // reached a row — a `.sldd`'s referenced sub-dictionaries.
    resolveLink,
    findUsages,
    resolveDictionaryReferences,
    // The batched row projection for a whole table. There is deliberately no `rowFor(node)`
    // beside it: `node.toRow()` IS that call now that the usage resolver is injected into
    // the tree, and a session-level alias for it would be a second name for one projection.
    rowsOf,
    beginBatch,
    endBatch,
    editProperty,
    addEntry,
    // The selection-driven mutation forms, for a host that already tracks a
    // selection, and the explicit (nodeId) forms beside them for one that does not.
    // Both are supported surface: neither is a deprecation of the other.
    addChild: addChild2,
    deleteNode,
    addChildTo,
    deleteNodeById,
    deleteNodesById,
    // For a host whose mutations do NOT come through the forms above (it owns its own
    // undo stack and edits nodes in place): the wrappers that keep the node index and
    // the selection honest across such an edit, at subtree scope instead of a re-parse.
    // mutateSubtree for an edit inside a subtree, index/unindexSubtree for a whole
    // subtree joining or leaving the tree.
    mutateSubtree,
    indexSubtree,
    unindexSubtree,
    undo: undoAction,
    redo: redoAction,
    canUndo: canUndoActive,
    canRedo: canRedoActive,
    bus
  };
  return session;
}
var DataModel = createSession({ bus: defaultBus });

// node_modules/data-explorer-core/dist/datamodel/parser/SlddScan.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var OPEN_OBJECT = encoder.encode("<Object");
var CLOSE_OBJECT = encoder.encode("</Object>");
function skipTable(needle) {
  const skip = new Int32Array(256).fill(needle.length);
  for (let i = 0; i < needle.length - 1; i++) {
    skip[needle[i]] = needle.length - 1 - i;
  }
  return skip;
}
var OPEN_SKIP = skipTable(OPEN_OBJECT);
var CLOSE_SKIP = skipTable(CLOSE_OBJECT);
var DATASOURCE_OPEN = encoder.encode("<DataSource");
var CLASS_NAME21 = encoder.encode("Class");
var P_NAME = encoder.encode('<P Name="');
var CLASS_ENTRY = encoder.encode('DD.ENTRY"');
var CLASS_REFERENCE = encoder.encode('DD.DICTIONARYREFERENCE"');
var NAME_ATTR_VALUE = encoder.encode('Name"');
var SUBDICTIONARY_ATTR_VALUE = encoder.encode('Subdictionary"');

// node_modules/data-explorer-core/dist/datamodel/parser/MatScan.js
var decoder2 = new TextDecoder();

// node_modules/data-explorer-core/dist/datamodel/parser/ModelStructureScan.js
var STRUCTURAL_PARTS = /* @__PURE__ */ new Set([
  // The linked dictionary, the UUID and the model-workspace MAT source. R2026b+.
  "simulink/blockDiagram.json",
  // The same three facts as `<P Name="...">` children before that, AND the inline
  // `GraphicalInterface` before R2014b. Still written by R2020a+ packages, where it is
  // small because the blocks have moved to `systems/*.xml` — which is exactly why this
  // scan wins there and does NOT win on a pre-R2020a model, where this part is the
  // whole model and there is nothing to skip.
  "simulink/blockdiagram.xml",
  // Model references: JSON from R2024b, XML from R2014b.
  "simulink/graphicalInterface.json",
  "simulink/graphicalInterface.xml",
  // External data sources.
  "simulink/ExternalDataSourceSettings.xml"
]);
var isStructuralPart = (name) => STRUCTURAL_PARTS.has(name);
function scanModelStructure(buffer, filename) {
  const bytes = new Uint8Array(buffer);
  const parsed = isZipPackage(bytes) ? parseModelParts(unzipEntries(bytes, isStructuralPart), filename) : parseModel(buffer, filename);
  return {
    dataDictionary: parsed.dataDictionary,
    modelReferences: parsed.modelReferences,
    externalDataSources: parsed.externalDataSources
  };
}

// scanner.mjs
var SCANNER_VERSION = "0.1.0";
var SUPPORTED = /* @__PURE__ */ new Set([".slx", ".mdl", ".sldd", ".mat"]);
var MAX_FILES = 1e4;
var MAX_FILE_BYTES = 512 * 1024 * 1024;
var MAX_TOTAL_BYTES = 1024 * 1024 * 1024;
function normalizePath(value) {
  return value.replaceAll("\\", "/").replace(/^\.\/+/, "");
}
function kindFor(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".slx" || extension === ".mdl") return "model";
  if (extension === ".sldd") return "data-dictionary";
  if (extension === ".mat") return "mat-file";
  return "unknown";
}
function arrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
async function filesUnder(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await filesUnder(root, path));
    } else if (entry.isFile() && SUPPORTED.has(extname(entry.name).toLowerCase())) {
      files.push({ absolute: path, relative: normalizePath(relative(root, path)) });
    }
  }
  return files;
}
function modelEdges(path, structure) {
  const edges = [];
  const extension = refModelExt(path);
  for (const reference of structure.modelReferences ?? []) {
    const name = reference?.modelName;
    if (typeof name !== "string" || !name) continue;
    edges.push({
      source: path,
      target: extname(name) ? name : `${name}${extension}`,
      type: "model-reference"
    });
  }
  if (typeof structure.dataDictionary === "string" && structure.dataDictionary) {
    edges.push({
      source: path,
      target: structure.dataDictionary,
      type: "data-dictionary"
    });
  }
  for (const source of structure.externalDataSources ?? []) {
    if (typeof source !== "string" || !source) continue;
    edges.push({
      source: path,
      target: source,
      type: extname(source).toLowerCase() === ".sldd" ? "data-dictionary" : "external-data"
    });
  }
  return edges;
}
async function scan(root) {
  const nodes = [];
  const edges = [];
  const errors = [];
  const files = await filesUnder(root);
  if (files.length > MAX_FILES) {
    throw new Error(`Workspace contains ${files.length} supported files; limit is ${MAX_FILES}.`);
  }
  let totalBytes = 0;
  for (const file of files) {
    nodes.push({ path: file.relative, kind: kindFor(file.relative) });
    if (kindFor(file.relative) !== "model") continue;
    try {
      const info = await stat(file.absolute);
      totalBytes += info.size;
      if (info.size > MAX_FILE_BYTES) {
        throw new Error("Model exceeds the 512 MiB structural scan limit.");
      }
      if (totalBytes > MAX_TOTAL_BYTES) {
        throw new Error("Models exceed the 1 GiB total structural scan limit.");
      }
      const bytes = await readFile(file.absolute);
      const structure = scanModelStructure(arrayBuffer(bytes), file.relative);
      edges.push(...modelEdges(file.relative, structure));
    } catch (error) {
      errors.push({
        path: file.relative,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
  nodes.sort((left, right) => left.path.localeCompare(right.path));
  edges.sort(
    (left, right) => `${left.source}\0${left.type}\0${left.target}`.localeCompare(
      `${right.source}\0${right.type}\0${right.target}`
    )
  );
  errors.sort((left, right) => left.path.localeCompare(right.path));
  return {
    schemaVersion: "0.1.0",
    scanner: {
      name: "data-explorer-core",
      version: "1.32.0",
      wrapperVersion: SCANNER_VERSION,
      trust: "structural-non-semantic"
    },
    status: errors.length ? "partial" : "complete",
    nodes,
    edges,
    errors
  };
}
async function main() {
  if (process.argv.includes("--help")) {
    process.stdout.write("Usage: scanner.mjs --root <directory>\n");
    return;
  }
  const rootIndex = process.argv.indexOf("--root");
  if (rootIndex < 0 || !process.argv[rootIndex + 1]) {
    throw new Error("--root is required");
  }
  process.stdout.write(`${JSON.stringify(await scan(process.argv[rootIndex + 1]))}
`);
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}
`);
    process.exitCode = 1;
  });
}
export {
  scan
};
