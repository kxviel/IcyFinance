import { Button } from "@/components/ui/button";

const WorkspaceError = () => (
  <main className="workspace-state">
    <h1>Unable to load the app</h1>
    <p>Reload the workspace to try again. Your saved budget remains on this device.</p>
    <Button variant="default" onClick={() => location.reload()}>
      Reload workspace
    </Button>
  </main>
);
export default WorkspaceError;
