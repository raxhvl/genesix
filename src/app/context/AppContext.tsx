"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

type Challenge = {
  id: number;
  title: string;
  tasks: Task[];
};

type Task = {
  id: number;
  title: string;
  description: string;
  points: number;
  proofType: "link" | "text" | "image";
};

type AppContextType = {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  challenges: Challenge[];
  completedTasks: number[];
  completeTask: (taskId: number) => void;
  skipTask: (taskId: number) => void;
  points: number;
  isNewUser: boolean;
  setIsNewUser: (isNew: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [points, setPoints] = useState(0);
  const [isNewUser, setIsNewUser] = useState(true);

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Day 1: Getting Started",
      tasks: [
        {
          id: 1,
          title: "Set up your workstation",
          description: "Ensure your desk is set up ergonomically",
          points: 10,
          proofType: "image",
        },
        {
          id: 2,
          title: "Install required software",
          description: "Install all the necessary software for your role",
          points: 20,
          proofType: "text",
        },
        {
          id: 3,
          title: "Complete HR paperwork",
          description: "Fill out all required HR forms",
          points: 15,
          proofType: "link",
        },
      ],
    },
  ];

  const completeTask = (taskId: number) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
      const task = challenges
        .flatMap((c) => c.tasks)
        .find((t) => t.id === taskId);
      if (task) {
        setPoints(points + task.points);
      }
    }
  };

  const skipTask = (taskId: number) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
    }
  };

  useEffect(() => {
    const storedProgress = localStorage.getItem("gensixProgress");
    if (storedProgress) {
      const { currentDay, completedTasks, points, isNewUser } =
        JSON.parse(storedProgress);
      setCurrentDay(currentDay);
      setCompletedTasks(completedTasks);
      setPoints(points);
      setIsNewUser(isNewUser);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "gensixProgress",
      JSON.stringify({ currentDay, completedTasks, points, isNewUser })
    );
  }, [currentDay, completedTasks, points, isNewUser]);

  return (
    <AppContext.Provider
      value={{
        currentDay,
        setCurrentDay,
        challenges,
        completedTasks,
        completeTask,
        skipTask,
        points,
        isNewUser,
        setIsNewUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
