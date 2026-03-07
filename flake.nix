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

          extension = pkgs.buildNpmPackage {
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

          manifest = builtins.fromJSON (builtins.readFile "${extension}/share/chromium-extension/manifest.json");

          extId = builtins.readFile (pkgs.runCommand "redirect-domains-ext-id" {
            nativeBuildInputs = [ pkgs.python3 pkgs.openssl ];
          } ''
            python3 ${./nix/crx-id.py} ${./keys/signing.pem} > $out
          '');

          crx = pkgs.runCommand "redirect-domains-crx" {
            nativeBuildInputs = [ pkgs.python3 pkgs.openssl ];
          } ''
            mkdir -p $out
            python3 ${./nix/pack-crx3.py} ${extension}/share/chromium-extension ${./keys/signing.pem} $out/extension.crx
          '';

        in {
          inherit extension;
          default = pkgs.linkFarm "redirect-domains" [
            { name = "share/chromium/extensions/${extId}.json";
              path = pkgs.writeText "${extId}.json" (builtins.toJSON {
                external_crx = "${crx}/extension.crx";
                external_version = manifest.version;
              });
            }
          ];
        });
    };
}
