import ApplicationTracker from "@/components/dashboard/ApplicationTracker";
import JobDigestWidget from "@/components/dashboard/JobDigestWidget";
import { Briefcase } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Briefcase className="w-5 h-5 text-amber-400" />
        <div>
          <h1 className="text-xl font-semibold text-white">Jobs</h1>
          <p className="text-sm text-gray-500">
            AI picks the best jobs for you daily · track every application
          </p>
        </div>
      </div>

      {/* AI Job Digest */}
      <JobDigestWidget />

      {/* Application Tracker */}
      <ApplicationTracker />
    </div>
  );
}
