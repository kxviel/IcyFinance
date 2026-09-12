import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { useSettings } from "@/hooks/use-settings";

type Props = Pick<
	ReturnType<typeof useSettings>,
	"busy" | "fileInput" | "exportLocal" | "importFile"
>;
const BackupSettings = ({
	busy,
	fileInput,
	exportLocal,
	importFile,
}: Props) => {
	return (
		<Card className="min-w-0 rounded-xl border border-border bg-background py-6 shadow-none ring-0">
			<CardHeader>
				<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80">
					<div>
						<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
							03 / KEEP A COPY
						</span>
						<h2>Yours to take.</h2>
					</div>
					<Download size={21} />
				</div>
			</CardHeader>
			<CardContent className="grid gap-5">
				<p className="text-muted-foreground">
					Export a portable JSON backup before making a large change, or restore
					one you already have.
				</p>
				<div className="button-row flex items-center gap-2.5 flex-wrap">
					<Button
						variant="outline"
						onClick={exportLocal}
						disabled={Boolean(busy)}
					>
						<Download size={15} /> Export backup
					</Button>
					<Button
						variant="outline"
						onClick={() => fileInput.current?.click()}
						disabled={Boolean(busy)}
					>
						<Upload size={15} /> Import backup
					</Button>
				</div>
				<Input
					ref={fileInput}
					hidden
					type="file"
					accept=".json,application/json"
					onChange={importFile}
					aria-label="Import an IcyFinance JSON backup"
				/>
				<p className="text-muted-foreground small text-[12px]">
					Imports are validated, and the current budget is exported before
					replacement.
				</p>
			</CardContent>
		</Card>
	);
};
export default BackupSettings;
