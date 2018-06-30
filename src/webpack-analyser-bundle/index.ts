import {
    chain, Rule, SchematicContext, SchematicsException, Tree
} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from "@angular-devkit/schematics/tasks";
import {addPackageToPackageJson} from "../utils/utils";

export function WebpackAnalyserBundleSchematic(): Rule {

    return chain([
        () => {
            // Show the options for this Schematics.
            console.log('🐬️  Set up webpack-analyser-bundle in your angular app');
        },
        addLibsToPackageJson(),
        addPackageJsonConfig()
    ]);
}

/** Add needed lib to package.json if not already present. */
function addLibsToPackageJson() {
    return (host: Tree, context: SchematicContext) => {
        addPackageToPackageJson(host, 'devDependencies', 'webpack-bundle-analyzer', '^2.13.1');
        context.addTask(new NodePackageInstallTask());
        return host;
    };
}

const addPackageJsonConfig = (): Rule => {
    return (host: Tree) => {
        const packageJsonFile = 'package.json';
        const angularJsonFile = 'angular.json';
        const bufferPackageJson = host.read(packageJsonFile);
        const bufferAngularJson = host.read(angularJsonFile);
        if (bufferPackageJson === null) {
            throw new SchematicsException(`Could not read file: ${packageJsonFile}`);
        }
        if (bufferAngularJson === null) {
            throw new SchematicsException(`Could not read file: ${angularJsonFile}`);
        }
        const packageJson = JSON.parse(bufferPackageJson.toString());
        const angularJson = JSON.parse(bufferAngularJson.toString());
        const defaultProjectOutputPath = angularJson.projects[angularJson.defaultProject].architect.build.options.outputPath;
        if (!packageJson.scripts['gen-stats']) {
            packageJson.scripts['gen-stats'] = "ng build --prod --stats-json";
        }
        if (!packageJson.scripts['view-stats']) {
            packageJson.scripts['view-stats'] = `webpack-bundle-analyzer ${defaultProjectOutputPath}/stats.json`;
        }

        host.overwrite(packageJsonFile, JSON.stringify(packageJson, null, 2));
        return host;
    };
};