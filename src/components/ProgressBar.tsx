import { useAppContext } from "../app/context/AppContext";
import Link from "next/link";

export default function ProgressBar({
  currentChallengeId,
}: {
  currentChallengeId?: number;
}) {
  const { challenges, completedTasks } = useAppContext();

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {challenges.map((challenge) => {
          const isCompleted = challenge.tasks.every((task) =>
            completedTasks.includes(task.id)
          );
          const isCurrent = challenge.id === currentChallengeId;
          const isAccessible = challenge.id <= currentChallengeId;

          return (
            <Link
              key={challenge.id}
              href={isAccessible ? `/challenges/${challenge.id}` : "#"}
              className={`flex flex-col items-center ${
                isAccessible
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-1
                  ${
                    isCompleted
                      ? "bg-green-500"
                      : isCurrent
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
              >
                {challenge.id}
              </div>
              <span className="text-xs text-center">
                {challenge.title.split(":")[0]}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="relative">
        <div className="absolute top-0 left-0 h-2 bg-gray-200 w-full rounded"></div>
        <div
          className="absolute top-0 left-0 h-2 bg-green-500 rounded transition-all duration-500 ease-in-out"
          style={{
            width: `${
              (((currentChallengeId || 1) - 1) / (challenges.length - 1)) * 100
            }%`,
          }}
        ></div>
      </div>
    </div>
  );
}
