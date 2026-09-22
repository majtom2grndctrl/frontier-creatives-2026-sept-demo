import { ContentColumn } from "@/components/dashboard/app-shell";

/**
 * Stub destination — §14.12 allows other sidebar destinations to render a stub
 * page. Only the Home dashboard is in scope for this spec.
 */
export default function AnalyticsPage() {
  return (
    <ContentColumn>
      <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
        Analytics is out of scope for this prototype.
      </div>
    </ContentColumn>
  );
}
