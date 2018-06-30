import {
    apply, chain, mergeWith, move, Rule, SchematicContext, SchematicsException, template, Tree,
    url
} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from "@angular-devkit/schematics/tasks";
import {addPackageToPackageJson} from "../utils/utils";

export function ToolingGitSchematic(): Rule {
    const copyConfigFiles = apply(url('./files'), [
        template({}),
        move('./')
    ]);

    return chain([
        () => {
            // Show the options for this Schematics.
            console.log('🐬️  Customize your environment with some cool stuffs');
        },
        mergeWith(copyConfigFiles),
        addLibsToPackageJson(),
        addPackageJsonConfig()
    ]);
}

/** Add needed lib to package.json if not already present. */
function addLibsToPackageJson() {
    return (host: Tree, context: SchematicContext) => {
        addPackageToPackageJson(host, 'devDependencies', 'commitizen', '^2.10.1');
        addPackageToPackageJson(host, 'devDependencies', 'cz-customizable', '^5.2.0');
        addPackageToPackageJson(host, 'devDependencies', 'husky', '^0.14.3');
        addPackageToPackageJson(host, 'devDependencies', 'lint-staged', '^7.2.0');
        addPackageToPackageJson(host, 'devDependencies', 'prettier', '^1.13.7');
        context.addTask(new NodePackageInstallTask());
        return host;
    };
}

const addPackageJsonConfig = (): Rule => {
    return (host: Tree) => {
        const packageJsonFile = 'package.json';
        const buffer = host.read(packageJsonFile);
        if (buffer === null) {
            throw new SchematicsException(`Could not read file: ${packageJsonFile}`);
        }
        const packageJson = JSON.parse(buffer.toString());
        if (!packageJson.scripts['precommit']) {
            packageJson.scripts['precommit'] = 'lint-staged';
        }
        if (!packageJson.scripts['commit']) {
            packageJson.scripts['commit'] = 'git-cz';
        }
        if (!(packageJson['config'] && packageJson['config'].commitizen)) {
            packageJson['config'] = {
                "commitizen": {
                    "path": "node_modules/cz-customizable"
                },
                "cz-customizable": {
                    "config": ".cz-config.js"
                }
            };
        }

        host.overwrite(packageJsonFile, JSON.stringify(packageJson, null, 2));
        return host;
    };
};