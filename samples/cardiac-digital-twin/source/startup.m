%% startup.m
% Sample-local MATLAB initializer adapted from the upstream project.
% Run once from MATLAB before building or loading the model.

sampleRoot = fileparts(mfilename("fullpath"));
addpath(sampleRoot);
run(fullfile(sampleRoot, "cardiac_params.m"));

modelFile = fullfile(sampleRoot, "CardiacDigitalTwin.slx");
if exist(modelFile, "file")
    load_system(modelFile);
else
    run(fullfile(sampleRoot, "create_cardiac_model.m"));
end
