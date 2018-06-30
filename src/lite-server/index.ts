import {
    chain, Rule, SchematicContext, SchematicsException, Tree
} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from "@angular-devkit/schematics/tasks";
import {addPackageToPackageJson} from "../utils/utils";

export function LiteServerSchematic(): Rule {

    return chain([
        () => {
            // Show the options for this Schematics.
            console.log('🐬️  Set up lite-server in your angular app');
        },
        addLibsToPackageJson(),
        addPackageJsonConfig()
    ]);
}

/** Add needed lib to package.json if not already present. */
function addLibsToPackageJson() {
    return (host: Tree, context: SchematicContext) => {
        addPackageToPackageJson(host, 'devDependencies', 'lite-server', '^2.4.0');
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
        if (!packageJson.scripts['start-lite']) {
            packageJson.scripts['start-lite'] = `lite-server --baseDir="${defaultProjectOutputPath}"`;
        }

        host.overwrite(packageJsonFile, JSON.stringify(packageJson, null, 2));
        return host;
    };
};