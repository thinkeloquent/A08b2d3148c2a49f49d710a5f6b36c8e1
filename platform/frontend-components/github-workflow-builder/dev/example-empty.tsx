import { GithubWorkflowBuilder } from '../src';

export default function ExampleEmpty() {
  return (
    <GithubWorkflowBuilder
      initialWorkflows={[]}
      initialUtils={[]}
    />
  );
}
