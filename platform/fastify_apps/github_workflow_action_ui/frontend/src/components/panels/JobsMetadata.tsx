import { useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import type { WorkflowRun, WorkflowJob } from "@/types";
import { formatDate, duration } from "@/lib/formatters";
import { StatusIcon, Spinner } from "@/components/common";

interface JobsMetadataProps {
  run: WorkflowRun;
  jobs: WorkflowJob[];
  isLoading: boolean;
  initialExpandedJobId: number | null;
}

export function JobsMetadata({
  run,
  jobs,
  isLoading,
  initialExpandedJobId
}: JobsMetadataProps) {
  const [expandedJob, setExpandedJob] = useState<number | null>(
    initialExpandedJobId
  );

  const metaFields = [
  { k: "Run ID", v: String(run.id) },
  { k: "Attempt", v: String(run.run_attempt) },
  { k: "Event", v: run.event },
  { k: "Branch", v: run.head_branch },
  { k: "Started", v: formatDate(run.run_started_at) },
  { k: "Updated", v: formatDate(run.updated_at) },
  { k: "Duration", v: duration(run.run_started_at, run.updated_at) },
  { k: "Actor", v: run.actor?.login }].
  filter((x) => x.v && x.v !== "—");

  return (
    <div className="px-6 pt-5 pb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Metadata
        <span className="text-xs font-normal text-gray-400 ml-1.5" data-test-id="span-0466ea32">
          — Jobs & Steps
        </span>
      </h3>

      {isLoading && <Spinner />}
      {!isLoading && jobs.length === 0 &&
      <p className="text-xs text-gray-400 py-2">No jobs found</p>
      }

      {/* Run metadata */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-5 text-xs">
        {metaFields.map((x) =>
        <div key={x.k} className="flex items-baseline gap-2 py-1">
            <span className="text-gray-400 w-20 shrink-0">{x.k}</span>
            <span className="text-gray-700 font-medium truncate">{x.v}</span>
          </div>
        )}
      </div>

      {/* Jobs expandable list */}
      {!isLoading && jobs.length > 0 &&
      <div className="space-y-1.5">
          {jobs.map((job) => {
          const open = expandedJob === job.id;
          return (
            <div
              key={job.id}
              className="border border-gray-200 rounded-xl overflow-hidden">

                <button
                onClick={() => setExpandedJob(open ? null : job.id)}
                className="w-full text-left px-3.5 py-3 flex items-center gap-2.5 hover:bg-gray-50 transition">

                  <StatusIcon
                  conclusion={job.conclusion}
                  status={job.status}
                  size={18} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {job.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-gray-400">
                    <Clock size={12} />
                    <span className="text-[11px]">
                      {duration(job.started_at, job.completed_at)}
                    </span>
                  </div>
                  <ChevronRight
                  size={14}
                  className={`text-gray-300 transition-transform ${open ? "rotate-90" : ""}`} />

                </button>
                {open && job.steps?.length > 0 &&
              <div className="border-t border-gray-100 bg-gray-50/50 py-1 px-1.5">
                    {job.steps.map((st) =>
                <div
                  key={st.number}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-white transition">

                        <StatusIcon
                    conclusion={st.conclusion}
                    status={st.status}
                    size={14} />

                        <span className="text-[11px] text-gray-400 w-4 text-right">
                          {st.number}
                        </span>
                        <span className="text-xs text-gray-700 flex-1 truncate">
                          {st.name}
                        </span>
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {duration(st.started_at, st.completed_at)}
                        </span>
                      </div>
                )}
                  </div>
              }
              </div>);

        })}
        </div>
      }
    </div>);

}