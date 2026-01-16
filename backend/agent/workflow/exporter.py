import os
from datetime import datetime


class WorkflowExporter:
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def save_markdown(self, run_id: str, content: str) -> str:
        filename = f"memoire_{run_id}.md"
        path = os.path.join(self.output_dir, filename)

        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

        return path

    def save_log(self, run_id: str, data: dict) -> str:
        filename = f"log_{run_id}.txt"
        path = os.path.join(self.output_dir, filename)

        with open(path, "w", encoding="utf-8") as f:
            f.write(f"Generated at: {datetime.now().isoformat()}\n\n")
            f.write(str(data))

        return path