"use client";

import { useWeb3Context } from "@/lib/context/Web3Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { abi, getContractAddress } from "@/lib/config";

export default function Page() {
  const { isOwner, chainId } = useWeb3Context();
  const [newApprover, setNewApprover] = useState("");
  const [removeApprover, setRemoveApprover] = useState("");
  const contractAddress = getContractAddress(chainId);

  const { writeContract: addApprover, isPending: isAdding } =
    useWriteContract();
  const { writeContract: removeApproverFn, isPending: isRemoving } =
    useWriteContract();

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

  const handleAdd = () => {
    if (!newApprover) return;
    addApprover({
      address: contractAddress,
      abi,
      functionName: "addApprover",
      args: [newApprover],
    });
    setNewApprover("");
  };

  const handleRemove = () => {
    if (!removeApprover) return;
    removeApproverFn({
      address: contractAddress,
      abi,
      functionName: "removeApprover",
      args: [removeApprover],
    });
    setRemoveApprover("");
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
            <Button onClick={handleAdd} disabled={isAdding || !newApprover}>
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
              onClick={handleRemove}
              disabled={isRemoving || !removeApprover}
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
