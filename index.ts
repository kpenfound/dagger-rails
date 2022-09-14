import { client, DaggerServer, gql, FSID } from "@dagger.io/dagger";
// Based on yarn example
const resolvers = {
  Rails: {
    script: async (args: { source: FSID; runArgs: Array<string> }) => {
      const base = await client
        .request(
          gql`
            {
              core {
                image(ref: "ruby:3.1.2-buster") {
                  exec(input: {
                    args: ["bundle", "config", "set", "force_ruby_platform", "true"]
                  }) {
                    fs {
                      id
                    }
                  }
                }
              }
            }
          `
        )
        .then((result: any) => result.core.image.exec.fs);

        const bundleCache = await client
        .request(
          gql`
            {
              core {
                filesystem(id: "${base.id}") {
                  exec(input: {
                    args: ["bin/bundle", "install"], 
                    mounts: [{path: "/src", fs: "${args.source}"}],
                    workdir: "/src",
                    env: [
                      {name: "BUNDLE_CACHE_PATH", value: "/cache"},
                      {name: "BUNDLE_CACHE_ALL", value: "true"},
                      {name: "GIT_SSH_COMMAND", value: "ssh -o StrictHostKeyChecking=no"}
                    ],
                    cacheMounts:{name:"rails", path:"/cache", sharingMode:"locked"},
                    sshAuthSock: "/ssh-agent"
                  }) {
                    fs {
                      id
                    }
                  }
                }
              }
            }
          `
        )
        .then((result: any) => result.core.filesystem.exec.fs);

      const cmd = JSON.stringify(["bin/rails", ...args.runArgs]);
      const railsRun = await client
        .request(
          gql`
            {
              core {
                filesystem(id: "${bundleCache.id}") {
                  exec(input: {
                    args: ${cmd},
                    mounts: [{path: "/src", fs: "${args.source}"}],
                    workdir: "/src",
                    env: [
                      {name: "BUNDLE_CACHE_PATH", value: "/cache"},
                      {name: "GIT_SSH_COMMAND", value: "ssh -o StrictHostKeyChecking=no"}
                    ],
                    cacheMounts:{name:"rails", path:"/cache", sharingMode:"locked"},
                    sshAuthSock: "/ssh-agent"
                  }) {
                    mount(path: "/src") {
                      id
                    }
                  }
                }
              }
            }
          `
        )
        .then((result: any) => result.core.filesystem.exec.mount);

      return railsRun;
    },
  },
  Filesystem: {
    rails: async (args: { runArgs: Array<string> }, parent: { id: FSID }) => {
      return resolvers.Rails.script({
        source: parent.id,
        runArgs: args.runArgs,
      });
    },
  },
};

const server = new DaggerServer({
  resolvers,
});

server.run();
