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
  validateProof: (proof: string) => Promise<boolean>;
};

type AppContextType = {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  challenges: Challenge[];
  completedTasks: number[];
  completeTask: (taskId: number, proof: string) => Promise<boolean>;
  skipTask: (taskId: number) => void;
  points: number;
  isNewUser: boolean;
  setIsNewUser: (isNew: boolean) => void;
  skippedTasks: number[];
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
  const [skippedTasks, setSkippedTasks] = useState<number[]>([]);

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Day 1: Using Ethereum Mainnet",
      tasks: [
        {
          id: 1,
          title: "Set up a browser wallet",
          description: "Set up a browser wallet",
          points: 10,
          proofType: "image",
          validateProof: async () => true,
        },
        {
          id: 2,
          title: "Improve the privacy & security of your wallet",
          description: "Improve the privacy & security of your wallet",
          points: 20,
          proofType: "text",
          validateProof: async () => true,
        },
        {
          id: 3,
          title: "Create a multi-sig wallet",
          description: "Create a multi-sig wallet",
          points: 15,
          proofType: "link",
          validateProof: async () => true,
        },
        {
          id: 4,
          title: "Stake some ETH in a staking pool",
          description: "Stake some ETH in a staking pool",
          points: 10,
          proofType: "image",
          validateProof: async () => true,
        },
        {
          id: 5,
          title: "Restake on Eigenlayer",
          description: "Restake on Eigenlayer",
          points: 15,
          proofType: "text",
          validateProof: async () => true,
        },
        {
          id: 6,
          title: "Use a chain that’s not Ethereum",
          description: "Use a chain that’s not Ethereum",
          points: 15,
          proofType: "text",
          validateProof: async () => true,
        },
      ],
    },
    {
      id: 2,
      title: "Day 2: Read company mission and values",
      tasks: [
        {
          id: 6,
          title: "To be revealed.",
          description: "Make space! This task will be revealed soon.",
          points: 15,
          proofType: "text",
          validateProof: async () => true, // Dummy validation
        },
      ],
    },
    {
      id: 3,
      title:
        "Day 3: Explore bridges, wallets, privacy features, transactions, and more!",
      tasks: [
        {
          id: 6,
          title: "To be revealed.",
          description: "Make space! This task will be revealed soon.",
          points: 15,
          proofType: "text",
          validateProof: async () => true, // Dummy validation
        },
      ],
    },

    {
      id: 4,
      title: "Day 4:Play Onchain games, mint, buy and sell NFTs!",
      tasks: [
        {
          id: 6,
          title: "To be revealed.",
          description: "Make space! This task will be revealed soon.",
          points: 15,
          proofType: "text",
          validateProof: async () => true, // Dummy validation
        },
      ],
    },

    {
      id: 5,
      title: "Day 4: Join a DAO, learn about governance models, and more!",
      tasks: [
        {
          id: 6,
          title: "To be revealed.",
          description: "Make space! This task will be revealed soon.",
          points: 15,
          proofType: "text",
          validateProof: async () => true, // Dummy validation
        },
      ],
    },
    {
      id: 6,
      title: "Day 4: Create an Onchain social account, post content, and more!",
      tasks: [
        {
          id: 6,
          title: "To be revealed.",
          description: "Make space! This task will be revealed soon.",
          points: 15,
          proofType: "text",
          validateProof: async () => true, // Dummy validation
        },
      ],
    },
  ];

  const completeTask = async (taskId: number, proof: string) => {
    const task = challenges
      .flatMap((c) => c.tasks)
      .find((t) => t.id === taskId);
    if (task && !completedTasks.includes(taskId)) {
      const isValid = await task.validateProof(proof);
      if (isValid) {
        setCompletedTasks([...completedTasks, taskId]);
        setPoints(points + task.points);
        return true;
      }
    }
    return false;
  };

  const skipTask = (taskId: number) => {
    if (!completedTasks.includes(taskId) && !skippedTasks.includes(taskId)) {
      setSkippedTasks([...skippedTasks, taskId]);
    }
  };

  useEffect(() => {
    const storedProgress = localStorage.getItem("genesixAppProgress");
    if (storedProgress) {
      const { currentDay, completedTasks, points, isNewUser, skippedTasks } =
        JSON.parse(storedProgress);
      setCurrentDay(currentDay);
      setCompletedTasks(completedTasks);
      setPoints(points);
      setIsNewUser(isNewUser);
      setSkippedTasks(skippedTasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "genesixAppProgress",
      JSON.stringify({
        currentDay,
        completedTasks,
        skippedTasks,
        points,
        isNewUser,
      })
    );
  }, [currentDay, completedTasks, skippedTasks, points, isNewUser]);

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
        skippedTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
