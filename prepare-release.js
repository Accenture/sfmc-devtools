/* eslint-disable no-console */
import { exec } from 'node:child_process';

console.log('> git status --porcelain');
exec('git status --porcelain', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error executing git status: ${stderr}`);
        return;
    }

    if (stdout) {
        console.log(
            '    Found changes:',
            '\n     - ' + stdout.split('\n').filter(Boolean).join('\n     - ')
        );
        console.log('> git add .');
        exec('git add .', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing git add: ${stderr}`);
                return;
            }

            console.log('> git commit -n -m "prepare-release changes"');
            exec('git commit -n -m "prepare-release changes"', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error executing git commit: ${stderr}`);
                    return;
                } else {
                    console.log('✅ Changes committed successfully.');
                }
            });
        });
    } else {
        console.log('✅ No untracked files to commit.');
    }
});
/* eslint-enable no-console */
