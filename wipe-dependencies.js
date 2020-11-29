/* https://medium.com/@jh3y/how-to-update-all-npm-packages-in-your-project-at-once-17a8981860ea */

import { readFileSync, writeFileSync } from "fs";
const wipeDependencies = () => {
  const file = readFileSync("package.json");
  const content = JSON.parse(file);
  for (const devDep in content.devDependencies) {
    if (content.devDependencies[devDep].match(/\W+\d+.\d+.\d+-?((alpha|beta|rc)?.\d+)?/g)) {
      content.devDependencies[devDep] = "*";
    }
  }
  for (const dep in content.dependencies) {
    if (content.dependencies[dep].match(/\W+\d+.\d+.\d+-?((alpha|beta|rc)?.\d+)?/g)) {
      content.dependencies[dep] = "*";
    }
  }
  writeFileSync("package.json", JSON.stringify(content));
};
if (require.main === module) {
  wipeDependencies();
} else {
  module.exports = wipeDependencies;
}
