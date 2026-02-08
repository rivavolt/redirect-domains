{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      forAllSystems = nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed;
    in {
      packages = forAllSystems (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in {
          default = pkgs.buildNpmPackage {
            pname = "redirect-domains";
            version = "0.1.0";
            src = self;
            npmDepsHash = "sha256-ORP3vMpkgf4eq5pLPs9xjAbEJsUoL5XUSrcUeLp4CDM=";
            npmFlags = [ "--ignore-scripts" ];
            makeCacheWritable = true;

            env.CI = "1";

            buildPhase = ''
              runHook preBuild
              npx wxt prepare
              npx wxt build
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall
              mkdir -p $out/share/chromium-extension
              cp -r .output/chrome-mv3/* $out/share/chromium-extension/
              runHook postInstall
            '';

            dontNpmInstall = true;
          };
        });
    };
}
