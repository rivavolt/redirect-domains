{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nix-webext.url = "github:rivavolt/nix-webext";
  };

  outputs = { self, nixpkgs, nix-webext }:
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

          # WXT emits the Chrome manifest already; the build is keyless (CRX
          # signed at activation from the sops key). extId is the stable Chrome ID
          # the old committed key derived. Chrome-only.
          ext = nix-webext.lib.mkBrowserExtension {
            inherit pkgs extension;
            pname = "redirect-domains";
            version = (builtins.fromJSON (builtins.readFile ./package.json)).version;
            extId = "kfjckjhlmhkghgjgcckdclcoilodmajh";
            firefox = false;
            transformManifest = false;
          };
        in {
          inherit extension;
          inherit (ext) default chrome;
        });
    };
}
