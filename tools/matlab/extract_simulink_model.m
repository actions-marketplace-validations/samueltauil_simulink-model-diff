function extract_simulink_model(artifactPath, outputPath)
%EXTRACT_SIMULINK_MODEL Emit a deterministic canonical model manifest.
% This extractor performs static inspection only. load_system can execute a
% model PreLoadFcn, so callers must run it only in a reviewed, isolated runner.

    if nargin < 2
        outputPath = '';
    end
    artifact = char(string(artifactPath));
    outputPath = char(string(outputPath));

    if isempty(artifact) || ~isfile(artifact)
        manifest = failure_manifest(artifact, 'Model artifact was not found.', ...
            {'artifact-not-found'});
        emit_manifest(manifest, outputPath);
        exit(4);
    end

    if ~license('test', 'SIMULINK') || exist('load_system', 'file') ~= 2
        manifest = failure_manifest(artifact, ...
            'MATLAB/Simulink is unavailable or its license is inactive.', ...
            {'simulink-installation', 'simulink-license'});
        emit_manifest(manifest, outputPath);
        exit(10);
    end

    modelName = '';
    cleanup = [];
    try
        modelHandle = load_system(artifact);
        modelName = char(get_param(modelHandle, 'Name'));
        cleanup = onCleanup(@() close_loaded_model(modelName));
        [manifest, diagnostics] = enumerate_model_manifest(modelName, artifact);
        manifest.analysis.warnings = sorted_unique(diagnostics.warnings);
        manifest.analysis.unsupportedFeatures = sorted_unique(diagnostics.unsupported);
        if isempty(manifest.analysis.unsupportedFeatures)
            manifest.analysis.status = 'complete';
        else
            manifest.analysis.status = 'partial';
        end
        manifest.fingerprints = compute_fingerprints(manifest);
        emit_manifest(order_manifest(manifest), outputPath);
        clear cleanup;
        close_loaded_model(modelName);
        exit(0);
    catch ME
        clear cleanup;
        close_loaded_model(modelName);
        manifest = failure_manifest(artifact, ...
            sprintf('Model load or extraction failed: %s', ME.message), ...
            {'semantic-contract-incomplete'});
        emit_manifest(manifest, outputPath);
        exit(4);
    end
end

function [manifest, diagnostics] = enumerate_model_manifest(modelName, artifact)
    diagnostics = new_diagnostics();
    diagnostics = add_warning(diagnostics, ...
        ['Static extraction used load_system. A model PreLoadFcn can run during load; ' ...
         'use an isolated runner and only reviewed models.']);
    diagnostics = add_unsupported(diagnostics, 'compiled-model-attributes');
    diagnostics = add_unsupported(diagnostics, 'requirements-links');

    [blocks, diagnostics] = collect_blocks(modelName, diagnostics);
    [interfaces, diagnostics] = collect_interfaces(modelName, diagnostics);
    [connections, diagnostics] = collect_connections(modelName, diagnostics);
    [systems, diagnostics] = collect_systems(modelName, diagnostics);
    [references, diagnostics] = collect_references(modelName, blocks, diagnostics);
    [configuration, diagnostics] = collect_configuration(modelName, diagnostics);
    [stateflow, diagnostics] = collect_stateflow(modelName, diagnostics);

    manifest = struct();
    manifest.schemaVersion = '0.1.0';
    manifest.generator = struct( ...
        'name', 'simulink-model-drift-matlab-extractor', ...
        'version', '0.2.0', ...
        'strategy', 'matlab-static-api');
    manifest.source = struct( ...
        'artifact', repository_artifact_name(artifact), ...
        'artifactSha256', sha256_file(artifact), ...
        'simulinkRelease', ['R' version('-release')]);
    manifest.analysis = struct( ...
        'status', 'partial', ...
        'warnings', {{}}, ...
        'unsupportedFeatures', {{}});
    manifest.model = struct( ...
        'name', modelName, ...
        'modelType', safe_get_text(modelName, 'BlockDiagramType', 'model'), ...
        'rootPath', modelName);
    manifest.interfaces = interfaces;
    manifest.systems = systems;
    manifest.blocks = blocks;
    manifest.connections = connections;
    manifest.stateflow = stateflow;
    manifest.configuration = configuration;
    manifest.references = references;
    manifest.fingerprints = empty_fingerprints();
end

function [records, diagnostics] = collect_blocks(modelName, diagnostics)
    handles = find_system(modelName, ...
        'LookUnderMasks', 'all', 'FollowLinks', 'off', ...
        'FindAll', 'on', 'Type', 'Block');
    records = empty_struct_array();
    for index = 1:numel(handles)
        handle = handles(index);
        try
            pathValue = char(getfullname(handle));
            portHandles = get_param(handle, 'PortHandles');
            [parameters, diagnostics] = collect_parameters(handle, pathValue, diagnostics);
            reference = first_nonempty( ...
                safe_get_text(handle, 'ModelName', ''), ...
                safe_get_text(handle, 'ReferenceBlock', ''));
            record = struct( ...
                'id', block_id(pathValue), ...
                'path', pathValue, ...
                'name', safe_get_text(handle, 'Name', pathValue), ...
                'blockType', safe_get_text(handle, 'BlockType', 'Unknown'), ...
                'parent', safe_get_text(handle, 'Parent', modelName), ...
                'ports', struct( ...
                    'inputs', port_count(portHandles, 'Inport'), ...
                    'outputs', port_count(portHandles, 'Outport')), ...
                'reference', nullable_text(reference), ...
                'parameters', parameters);
            records(end + 1) = record; %#ok<AGROW>
        catch ME
            diagnostics = add_warning(diagnostics, ...
                sprintf('Block %d could not be extracted: %s', index, ME.message));
            diagnostics = add_unsupported(diagnostics, 'unreadable-block');
        end
    end
    records = sort_records(records, 'path');
end

function [parameters, diagnostics] = collect_parameters(handle, pathValue, diagnostics)
    parameters = struct();
    try
        metadata = get_param(handle, 'DialogParameters');
    catch ME
        diagnostics = add_warning(diagnostics, ...
            sprintf('Dialog parameters are unavailable for %s: %s', pathValue, ME.message));
        diagnostics = add_unsupported(diagnostics, 'unreadable-block-parameters');
        return;
    end
    if ~isstruct(metadata)
        return;
    end
    names = sort(fieldnames(metadata));
    for index = 1:numel(names)
        name = names{index};
        try
            rawValue = get_param(handle, name);
            [value, valueType] = json_value(rawValue);
            parameters.(name) = struct('value', value, 'valueType', valueType);
        catch ME
            diagnostics = add_warning(diagnostics, ...
                sprintf('Parameter %s on %s was skipped: %s', name, pathValue, ME.message));
            diagnostics = add_unsupported(diagnostics, 'unreadable-block-parameters');
        end
    end
end

function [interfaces, diagnostics] = collect_interfaces(modelName, diagnostics)
    [inports, diagnostics] = collect_interface_type(modelName, 'Inport', 'input', diagnostics);
    [outports, diagnostics] = collect_interface_type(modelName, 'Outport', 'output', diagnostics);
    [triggers, diagnostics] = collect_interface_type(modelName, 'TriggerPort', 'trigger', diagnostics);
    [enables, diagnostics] = collect_interface_type(modelName, 'EnablePort', 'enable', diagnostics);
    interfaces = struct( ...
        'inports', inports, ...
        'outports', outports, ...
        'triggerPorts', triggers, ...
        'enablePorts', enables, ...
        'buses', empty_struct_array());
end

function [records, diagnostics] = collect_interface_type(modelName, blockType, direction, diagnostics)
    handles = find_system(modelName, ...
        'SearchDepth', 1, 'LookUnderMasks', 'all', ...
        'FollowLinks', 'off', 'FindAll', 'on', 'Type', 'Block', ...
        'BlockType', blockType);
    records = empty_struct_array();
    for index = 1:numel(handles)
        handle = handles(index);
        pathValue = char(getfullname(handle));
        portValue = parse_positive_integer(safe_get_text(handle, 'Port', num2str(index)), index);
        [dimensions, parsed] = parse_dimensions(safe_get_text(handle, 'PortDimensions', ''));
        if ~parsed
            diagnostics = add_warning(diagnostics, ...
                sprintf('Declared dimensions for %s could not be normalized.', pathValue));
            diagnostics = add_unsupported(diagnostics, 'unresolved-interface-dimensions');
        end
        dataType = first_nonempty( ...
            safe_get_text(handle, 'OutDataTypeStr', ''), ...
            safe_get_text(handle, 'DataType', ''));
        sampleTime = safe_get_text(handle, 'SampleTime', '');
        unitValue = safe_get_text(handle, 'Unit', '');
        record = struct( ...
            'id', ['interface:' direction ':' normalize_path(pathValue)], ...
            'name', safe_get_text(handle, 'Name', blockType), ...
            'direction', direction, ...
            'port', portValue, ...
            'dataType', nullable_text(dataType), ...
            'dimensions', dimensions, ...
            'sampleTime', nullable_text(sampleTime), ...
            'unit', nullable_text(unitValue), ...
            'minimum', scalar_or_null(safe_get(handle, 'OutMin', [])), ...
            'maximum', scalar_or_null(safe_get(handle, 'OutMax', [])));
        records(end + 1) = record; %#ok<AGROW>
    end
    records = sort_records(records, 'id');
end

function [connections, diagnostics] = collect_connections(modelName, diagnostics)
    lines = find_system(modelName, ...
        'LookUnderMasks', 'all', 'FollowLinks', 'off', ...
        'FindAll', 'on', 'Type', 'Line');
    connections = empty_struct_array();
    for lineIndex = 1:numel(lines)
        lineHandle = lines(lineIndex);
        try
            sourcePort = get_param(lineHandle, 'SrcPortHandle');
            destinationPorts = get_param(lineHandle, 'DstPortHandle');
            if isempty(sourcePort) || sourcePort == -1 || isempty(destinationPorts)
                diagnostics = add_unsupported(diagnostics, 'unconnected-line-segment');
                continue;
            end
            for destinationIndex = 1:numel(destinationPorts)
                destinationPort = destinationPorts(destinationIndex);
                if destinationPort == -1
                    diagnostics = add_unsupported(diagnostics, 'unconnected-line-segment');
                    continue;
                end
                source = endpoint_for_port(sourcePort);
                destination = endpoint_for_port(destinationPort);
                signalName = safe_get_text(lineHandle, 'Name', '');
                identity = sprintf('%s:%d>%s:%d', ...
                    source.blockId, source.port, destination.blockId, destination.port);
                record = struct( ...
                    'id', ['connection:' sha256_text(identity)], ...
                    'source', source, ...
                    'destination', destination, ...
                    'signal', struct( ...
                        'name', nullable_text(signalName), ...
                        'dataType', [], ...
                        'dimensions', [], ...
                        'unit', []));
                connections(end + 1) = record; %#ok<AGROW>
            end
        catch ME
            diagnostics = add_warning(diagnostics, ...
                sprintf('Line %d could not be extracted: %s', lineIndex, ME.message));
            diagnostics = add_unsupported(diagnostics, 'unreadable-connection');
        end
    end
    connections = sort_records(connections, 'id');
end

function endpoint = endpoint_for_port(portHandle)
    blockHandle = get_param(portHandle, 'Parent');
    pathValue = char(getfullname(blockHandle));
    portNumber = parse_positive_integer(char(string(get_param(portHandle, 'PortNumber'))), 1);
    endpoint = struct('blockId', block_id(pathValue), 'port', portNumber);
end

function [systems, diagnostics] = collect_systems(modelName, diagnostics)
    systems = struct('id', ['system:' normalize_path(modelName)], ...
        'path', modelName, 'name', modelName, 'parent', []);
    try
        handles = find_system(modelName, ...
            'LookUnderMasks', 'all', 'FollowLinks', 'off', ...
            'FindAll', 'on', 'Type', 'Block', 'BlockType', 'SubSystem');
        for index = 1:numel(handles)
            pathValue = char(getfullname(handles(index)));
            systems(end + 1) = struct( ... %#ok<AGROW>
                'id', ['system:' normalize_path(pathValue)], ...
                'path', pathValue, ...
                'name', safe_get_text(handles(index), 'Name', pathValue), ...
                'parent', safe_get_text(handles(index), 'Parent', modelName));
        end
        systems = sort_records(systems, 'path');
    catch ME
        diagnostics = add_warning(diagnostics, ...
            sprintf('Subsystem inventory is incomplete: %s', ME.message));
        diagnostics = add_unsupported(diagnostics, 'unreadable-subsystem');
    end
end

function [references, diagnostics] = collect_references(modelName, blocks, diagnostics)
    models = {};
    libraries = {};
    for index = 1:numel(blocks)
        block = blocks(index);
        if strcmp(block.blockType, 'ModelReference') && ~isempty(block.reference)
            models{end + 1} = char(block.reference); %#ok<AGROW>
        elseif ~isempty(block.reference)
            libraries{end + 1} = char(block.reference); %#ok<AGROW>
        end
    end
    dictionary = safe_get_text(modelName, 'DataDictionary', '');
    dictionaries = {};
    if ~isempty(dictionary)
        dictionaries = {dictionary};
        diagnostics = add_unsupported(diagnostics, 'data-dictionary-content');
    end
    references = struct( ...
        'models', {sorted_unique(models)}, ...
        'libraries', {sorted_unique(libraries)}, ...
        'dataDictionaries', {sorted_unique(dictionaries)}, ...
        'requirements', {{}});
end

function [configuration, diagnostics] = collect_configuration(modelName, diagnostics)
    configuration = struct();
    selected = { ...
        'SolverType', 'Solver', 'FixedStep', 'StartTime', 'StopTime', ...
        'SystemTargetFile', 'HardwareBoard', 'ProdHWDeviceType'};
    available = get_param(modelName, 'ObjectParameters');
    for index = 1:numel(selected)
        name = selected{index};
        if ~isfield(available, name)
            continue;
        end
        try
            [value, ~] = json_value(get_param(modelName, name));
            configuration.(name) = value;
        catch ME
            diagnostics = add_warning(diagnostics, ...
                sprintf('Configuration parameter %s was skipped: %s', name, ME.message));
            diagnostics = add_unsupported(diagnostics, 'unreadable-configuration');
        end
    end
end

function [result, diagnostics] = collect_stateflow(modelName, diagnostics)
    result = empty_stateflow();
    if exist('sfroot', 'file') ~= 2 || ~license('test', 'STATEFLOW')
        diagnostics = add_unsupported(diagnostics, 'stateflow-api-or-license');
        return;
    end
    try
        machine = find(sfroot, '-isa', 'Stateflow.Machine', 'Name', modelName);
        if isempty(machine)
            return;
        end
        machine = machine(1);
        result.charts = stateflow_records(machine, 'Stateflow.Chart');
        result.states = stateflow_records(machine, 'Stateflow.State');
        result.transitions = transition_records(machine);
        result.junctions = stateflow_records(machine, 'Stateflow.Junction');
        result.events = stateflow_records(machine, 'Stateflow.Event');
        result.data = stateflow_records(machine, 'Stateflow.Data');
    catch ME
        diagnostics = add_warning(diagnostics, ...
            sprintf('Stateflow extraction is incomplete: %s', ME.message));
        diagnostics = add_unsupported(diagnostics, 'stateflow-extraction');
        result = empty_stateflow();
    end
end

function records = stateflow_records(machine, className)
    objects = find(machine, '-isa', className);
    records = empty_struct_array();
    for index = 1:numel(objects)
        object = objects(index);
        name = stateflow_property(object, 'Name', '');
        pathValue = stateflow_path(object, name);
        records(end + 1) = struct( ... %#ok<AGROW>
            'id', [lower(strrep(className, 'Stateflow.', '')) ':' sha256_text(pathValue)], ...
            'name', name, ...
            'path', pathValue);
    end
    records = sort_records(records, 'id');
end

function records = transition_records(machine)
    objects = find(machine, '-isa', 'Stateflow.Transition');
    records = empty_struct_array();
    for index = 1:numel(objects)
        object = objects(index);
        label = stateflow_property(object, 'LabelString', '');
        source = stateflow_endpoint(object, 'Source');
        destination = stateflow_endpoint(object, 'Destination');
        identity = sprintf('%s>%s:%s', source, destination, label);
        records(end + 1) = struct( ... %#ok<AGROW>
            'id', ['transition:' sha256_text(identity)], ...
            'label', label, ...
            'source', nullable_text(source), ...
            'destination', nullable_text(destination));
    end
    records = sort_records(records, 'id');
end

function value = stateflow_endpoint(object, propertyName)
    value = '';
    try
        endpoint = object.(propertyName);
        if ~isempty(endpoint)
            value = stateflow_path(endpoint, stateflow_property(endpoint, 'Name', ''));
        end
    catch
        value = '';
    end
end

function value = stateflow_path(object, fallback)
    value = stateflow_property(object, 'Path', '');
    if isempty(value)
        chart = stateflow_property(object, 'Chart', []);
        if ~isempty(chart)
            chartPath = stateflow_property(chart, 'Path', '');
            value = [char(string(chartPath)) '/' char(string(fallback))];
        else
            value = char(string(fallback));
        end
    end
end

function value = stateflow_property(object, name, fallback)
    try
        value = object.(name);
        if isstring(value)
            value = char(value);
        end
    catch
        value = fallback;
    end
end

function fingerprints = compute_fingerprints(manifest)
    structuralBlocks = manifest.blocks;
    parameterBlocks = empty_struct_array();
    for index = 1:numel(structuralBlocks)
        parameterBlocks(end + 1) = struct( ... %#ok<AGROW>
            'id', structuralBlocks(index).id, ...
            'path', structuralBlocks(index).path, ...
            'parameters', structuralBlocks(index).parameters);
        structuralBlocks(index).parameters = struct();
    end
    structureView = struct( ...
        'model', manifest.model, ...
        'systems', manifest.systems, ...
        'blocks', structuralBlocks, ...
        'connections', manifest.connections);
    modelView = struct( ...
        'model', manifest.model, ...
        'interfaces', manifest.interfaces, ...
        'systems', manifest.systems, ...
        'blocks', manifest.blocks, ...
        'connections', manifest.connections, ...
        'stateflow', manifest.stateflow, ...
        'configuration', manifest.configuration, ...
        'references', manifest.references);
    fingerprints = struct( ...
        'model', hash_json(modelView), ...
        'structure', hash_json(structureView), ...
        'interfaces', hash_json(manifest.interfaces), ...
        'parameters', hash_json(parameterBlocks), ...
        'stateflow', hash_json(manifest.stateflow), ...
        'configuration', hash_json(manifest.configuration));
end

function digest = hash_json(value)
    digest = sha256_text(jsonencode(order_fields_recursive(value)));
end

function value = order_fields_recursive(value)
    if isstruct(value)
        if numel(value) > 1
            for index = 1:numel(value)
                value(index) = order_fields_recursive(value(index));
            end
            return;
        end
        names = sort(fieldnames(value));
        ordered = struct();
        for index = 1:numel(names)
            name = names{index};
            ordered.(name) = order_fields_recursive(value.(name));
        end
        value = ordered;
    elseif iscell(value)
        for index = 1:numel(value)
            value{index} = order_fields_recursive(value{index});
        end
    end
end

function manifest = order_manifest(manifest)
    ordered = struct();
    ordered.('$schema') = ...
        'https://schemas.example.org/simulink-model-drift/canonical-model/0.1.0';
    ordered.schemaVersion = manifest.schemaVersion;
    ordered.generator = manifest.generator;
    ordered.source = manifest.source;
    ordered.analysis = manifest.analysis;
    ordered.model = manifest.model;
    ordered.interfaces = manifest.interfaces;
    ordered.systems = manifest.systems;
    ordered.blocks = manifest.blocks;
    ordered.connections = manifest.connections;
    ordered.stateflow = manifest.stateflow;
    ordered.configuration = manifest.configuration;
    ordered.references = manifest.references;
    ordered.fingerprints = manifest.fingerprints;
    manifest = ordered;
end

function manifest = failure_manifest(artifact, message, unsupported)
    artifactName = repository_artifact_name(artifact);
    if isempty(artifactName)
        artifactName = 'unresolved.slx';
    end
    if ~isempty(artifact) && isfile(artifact)
        artifactHash = sha256_file(artifact);
    else
        artifactHash = sha256_text(message);
    end
    manifest = struct();
    manifest.schemaVersion = '0.1.0';
    manifest.generator = struct( ...
        'name', 'simulink-model-drift-matlab-extractor', ...
        'version', '0.2.0', ...
        'strategy', 'matlab-static-api');
    manifest.source = struct( ...
        'artifact', artifactName, ...
        'artifactSha256', artifactHash, ...
        'simulinkRelease', ['R' version('-release')]);
    manifest.analysis = struct( ...
        'status', 'failed', ...
        'warnings', {{message}}, ...
        'unsupportedFeatures', {sorted_unique(unsupported)});
    manifest.model = struct('name', 'unresolved', 'modelType', 'model', 'rootPath', 'unresolved');
    manifest.interfaces = struct( ...
        'inports', empty_struct_array(), ...
        'outports', empty_struct_array(), ...
        'triggerPorts', empty_struct_array(), ...
        'enablePorts', empty_struct_array(), ...
        'buses', empty_struct_array());
    manifest.systems = empty_struct_array();
    manifest.blocks = empty_struct_array();
    manifest.connections = empty_struct_array();
    manifest.stateflow = empty_stateflow();
    manifest.configuration = struct();
    manifest.references = struct( ...
        'models', {{}}, 'libraries', {{}}, ...
        'dataDictionaries', {{}}, 'requirements', {{}});
    manifest.fingerprints = compute_fingerprints(manifest);
    manifest = order_manifest(manifest);
end

function emit_manifest(manifest, outputPath)
    text = jsonencode(manifest);
    if ~isempty(outputPath)
        parent = fileparts(outputPath);
        if ~isempty(parent) && ~isfolder(parent)
            mkdir(parent);
        end
        file = fopen(outputPath, 'wt', 'n', 'UTF-8');
        if file == -1
            error('simulink_model_drift:OutputOpenFailed', ...
                'Could not open output path: %s', outputPath);
        end
        cleanup = onCleanup(@() fclose(file));
        fprintf(file, '%s\n', text);
        clear cleanup;
    end
    fprintf(1, '%s\n', text);
end

function close_loaded_model(modelName)
    if ~isempty(modelName) && bdIsLoaded(modelName)
        close_system(modelName, 0);
    end
end

function digest = sha256_file(pathValue)
    file = fopen(pathValue, 'rb');
    if file == -1
        error('simulink_model_drift:ArtifactReadFailed', ...
            'Could not read artifact: %s', pathValue);
    end
    cleanup = onCleanup(@() fclose(file));
    digestObject = java.security.MessageDigest.getInstance('SHA-256');
    while true
        chunk = fread(file, 1024 * 1024, '*uint8');
        if isempty(chunk)
            break;
        end
        digestObject.update(chunk);
    end
    digest = digest_hex(digestObject.digest());
    clear cleanup;
end

function digest = sha256_text(textValue)
    digestObject = java.security.MessageDigest.getInstance('SHA-256');
    digestObject.update(unicode2native(char(string(textValue)), 'UTF-8'));
    digest = digest_hex(digestObject.digest());
end

function digest = digest_hex(bytes)
    values = typecast(bytes, 'uint8');
    digest = lower(reshape(dec2hex(values, 2).', 1, []));
end

function [value, valueType] = json_value(rawValue)
    valueType = class(rawValue);
    if isstring(rawValue)
        if isscalar(rawValue)
            value = char(rawValue);
        else
            value = cellstr(rawValue);
        end
    elseif ischar(rawValue) || isnumeric(rawValue) || islogical(rawValue) || iscell(rawValue)
        value = rawValue;
    elseif isempty(rawValue)
        value = [];
    else
        try
            jsonencode(rawValue);
            value = rawValue;
        catch
            value = char(string(rawValue));
        end
    end
end

function value = scalar_or_null(rawValue)
    if islogical(rawValue) && isscalar(rawValue)
        value = rawValue;
    elseif isnumeric(rawValue) && isscalar(rawValue) && isfinite(rawValue)
        value = double(rawValue);
    elseif ischar(rawValue) && ~isempty(rawValue)
        numericValue = str2double(rawValue);
        if isfinite(numericValue)
            value = numericValue;
        else
            value = rawValue;
        end
    else
        value = [];
    end
end

function [dimensions, parsed] = parse_dimensions(textValue)
    textValue = strtrim(char(string(textValue)));
    if isempty(textValue)
        dimensions = [];
        parsed = true;
        return;
    end
    tokens = regexp(textValue, '\d+', 'match');
    values = str2double(tokens);
    parsed = ~isempty(values) && all(isfinite(values)) && all(values >= 1);
    if parsed
        dimensions = values;
    else
        dimensions = [];
    end
end

function value = parse_positive_integer(textValue, fallback)
    value = str2double(char(string(textValue)));
    if ~isfinite(value) || value < 1 || floor(value) ~= value
        value = fallback;
    end
    value = double(value);
end

function count = port_count(portHandles, fieldName)
    if isfield(portHandles, fieldName)
        count = numel(portHandles.(fieldName));
    else
        count = 0;
    end
end

function value = safe_get(object, parameter, fallback)
    try
        value = get_param(object, parameter);
    catch
        value = fallback;
    end
end

function value = safe_get_text(object, parameter, fallback)
    value = safe_get(object, parameter, fallback);
    if isempty(value)
        value = fallback;
    end
    value = char(string(value));
end

function value = nullable_text(textValue)
    if isempty(textValue)
        value = [];
    else
        value = char(string(textValue));
    end
end

function value = first_nonempty(varargin)
    value = '';
    for index = 1:nargin
        candidate = varargin{index};
        if ~isempty(candidate)
            value = candidate;
            return;
        end
    end
end

function value = block_id(pathValue)
    value = ['block:' normalize_path(pathValue)];
end

function value = normalize_path(pathValue)
    value = strrep(char(string(pathValue)), '\', '/');
end

function value = repository_artifact_name(artifact)
    if isempty(artifact)
        value = '';
        return;
    end
    [~, name, extension] = fileparts(char(string(artifact)));
    value = [name extension];
end

function records = sort_records(records, fieldName)
    if numel(records) < 2
        return;
    end
    keys = cell(1, numel(records));
    for index = 1:numel(records)
        keys{index} = char(string(records(index).(fieldName)));
    end
    [~, order] = sort(keys);
    records = records(order);
end

function values = sorted_unique(values)
    if isempty(values)
        values = {};
        return;
    end
    values = cellfun(@(value) char(string(value)), values, 'UniformOutput', false);
    values = sort(unique(values));
end

function diagnostics = new_diagnostics()
    diagnostics = struct('warnings', {{}}, 'unsupported', {{}});
end

function diagnostics = add_warning(diagnostics, value)
    diagnostics.warnings{end + 1} = value;
end

function diagnostics = add_unsupported(diagnostics, value)
    diagnostics.unsupported{end + 1} = value;
end

function value = empty_stateflow()
    value = struct( ...
        'charts', empty_struct_array(), ...
        'states', empty_struct_array(), ...
        'transitions', empty_struct_array(), ...
        'junctions', empty_struct_array(), ...
        'events', empty_struct_array(), ...
        'data', empty_struct_array());
end

function value = empty_fingerprints()
    zero = repmat('0', 1, 64);
    value = struct( ...
        'model', zero, ...
        'structure', zero, ...
        'interfaces', zero, ...
        'parameters', zero, ...
        'stateflow', zero, ...
        'configuration', zero);
end

function value = empty_struct_array()
    value = struct.empty(0, 1);
end
