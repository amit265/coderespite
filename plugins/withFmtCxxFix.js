const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withFmtCxxFix = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let podfileContent = fs.readFileSync(podfilePath, "utf8");

      const targetFix = `
  # Add this fix for the fmt consteval error in Xcode 16+
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
  end
`;

      if (podfileContent.includes("post_install do |installer|")) {
        podfileContent = podfileContent.replace(
          "post_install do |installer|",
          `post_install do |installer|\n${targetFix}`
        );
      } else {
        console.warn("[withFmtCxxFix] Could not find post_install block in Podfile!");
      }

      fs.writeFileSync(podfilePath, podfileContent, "utf8");
      return config;
    },
  ]);
};

module.exports = withFmtCxxFix;
