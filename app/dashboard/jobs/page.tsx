import ApplicationTracker from "@/components/dashboard/ApplicationTracker";
import JobDigestWidget from "@/components/dashboard/JobDigestWidget";
import { Briefcase } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mt-10">
        <Briefcase className="size-4 lg:size-5 text-amber-400" />
        <div>
          <h1 className="lg:text-xl font-semibold text-white">Jobs</h1>
        </div>
      </div>

      {/* AI Job Digest */}
      <JobDigestWidget />

      {/* Application Tracker */}
      <ApplicationTracker />
    </div>
  );
}
