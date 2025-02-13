"use client";

import { useWeb3Context } from "@/lib/context/Web3Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useConfig } from "wagmi";
import { WriteContractErrorType } from "viem";
import { writeContract, simulateContract } from "@wagmi/core";
import { abi, getContractAddress } from "@/lib/config";

export default function Page() {
  const { isOwner, chainId } = useWeb3Context();
  const { toast } = useToast();
  const [newApprover, setNewApprover] = useState("");
  const [removeApprover, setRemoveApprover] = useState("");
  const contractAddress = getContractAddress(chainId);
  const config = useConfig();
  if (!isOwner) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p className="text-slate-400">
          Only the contract owner can access settings.
        </p>
      </div>
    );
  }

  const manageApprover = async (action: "addApprover" | "removeApprover") => {
    try {
      const { request } = await simulateContract(config, {
        address: contractAddress,
        abi,
        functionName: action,
        args: [action === "addApprover" ? newApprover : removeApprover],
      });

      await writeContract(config, request);

      toast({
        title: "Success",
        description: "Approver updated",
      });

      if (action === "addApprover") {
        setNewApprover("");
      } else {
        setRemoveApprover("");
      }
    } catch (e) {
      const error = e as WriteContractErrorType;
      if (error.message.includes("AlreadyApprover")) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Address is already an approver",
        });
      } else if (error.message.includes("NotApprover")) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Address is not an approver",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Contract Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Approver</CardTitle>
          <CardDescription>
            Grant approver rights to a new address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter address"
              value={newApprover}
              onChange={(e) => setNewApprover(e.target.value)}
            />
            <Button
              onClick={() => manageApprover("addApprover")}
              disabled={!newApprover}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remove Approver</CardTitle>
          <CardDescription>
            Remove approver rights from an address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter address"
              value={removeApprover}
              onChange={(e) => setRemoveApprover(e.target.value)}
            />
            <Button
              onClick={() => manageApprover("removeApprover")}
              disabled={!removeApprover}
              variant="destructive"
            >
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
