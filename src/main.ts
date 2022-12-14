import github from "@actions/github";
import core from "@actions/core";

async function run() {
  const token: string = core.getInput("repo-token", { required: true });
  const tag: string = core.getInput("tag", { required: true });
  const sha: string =
    core.getInput("commit-sha", { required: false }) || github.context.sha;

  const client = github.getOctokit(token);

  const refs = await client.rest.git.listMatchingRefs({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: `tags/${tag}`
  });

  if (refs.data.length > 0) {
    core.info(`Overwriting ${tag} with ${sha}`);
    await client.rest.git.updateRef({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ref: `refs/tags/${tag}`,
      sha: sha,
      force: true
    });
  } else {
    core.info(`Creating tag ${tag} for commit ${sha}`);
    await client.rest.git.createRef({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ref: `refs/tags/${tag}`,
      sha: sha
    });
  }
}

run().catch(error => core.setFailed("Workflow failed! " + error.message));
