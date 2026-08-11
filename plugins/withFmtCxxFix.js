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
        
        # Override any explicit compiler standard flags (like -std=c++20)
        cxx_flags = config.build_settings['OTHER_CPLUSPLUSFLAGS']
        if cxx_flags.is_a?(String)
          config.build_settings['OTHER_CPLUSPLUSFLAGS'] = cxx_flags.gsub(/-std=[^\\s]+/, '-std=c++17')
        elsif cxx_flags.is_a?(Array)
          config.build_settings['OTHER_CPLUSPLUSFLAGS'] = cxx_flags.map { |f| f.start_with?('-std=') ? '-std=c++17' : f }
        else
          config.build_settings['OTHER_CPLUSPLUSFLAGS'] = ['$(inherited)', '-std=c++17']
        end

        # Disable constexpr/consteval features in the fmt library preprocessor
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = (config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']) + ['FMT_USE_CONSTEXPR=0']
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
