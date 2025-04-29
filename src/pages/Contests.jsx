
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Music, Mic, Clock, DollarSign, Users, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ContestCreateDialog } from "@/components/contest/contest-create-dialog";

const Contests = () => {
  const [activeTab, setActiveTab] = useState("beats");
  const [contests, setContests] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select(`
          *,
          creator:users!contests_creator_id_fkey(username)
        `)
        .eq('type', activeTab === "beats" ? "beat_battle" : "open_verse")
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContests(data);
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contests",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, [activeTab]);

  const handleContestCreated = (newContest) => {
    setContests([newContest, ...contests]);
  };

  const formatTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff < 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days left`;
    return `${hours} hours left`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Music Contests</h1>
          <p className="text-muted-foreground">Compete with other artists and win prizes</p>
        </div>
        {user && (
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Contest
          </Button>
        )}
      </div>

      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab("beats")}
          className={`pb-2 px-4 ${
            activeTab === "beats"
              ? "border-b-2 border-primary font-semibold"
              : "text-muted-foreground"
          }`}
        >
          Beat Battles
        </button>
        <button
          onClick={() => setActiveTab("verses")}
          className={`pb-2 px-4 ${
            activeTab === "verses"
              ? "border-b-2 border-primary font-semibold"
              : "text-muted-foreground"
          }`}
        >
          Open Verses
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading contests...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {contests.map((contest, i) => (
            <motion.div
              key={contest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg border bg-card p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {contest.type === "beat_battle" ? "Beat Battle" : "Open Verse Challenge"}
                  </span>
                  <h3 className="text-xl font-semibold">
                    {contest.title}
                  </h3>
                </div>
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>

              <p className="text-sm text-muted-foreground">
                {contest.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{formatTimeLeft(contest.ends_at)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{contest.participants_count || 0} participants</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>${contest.prize_amount} prize</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  {contest.type === "beat_battle" ? (
                    <>
                      <Music className="mr-2 h-4 w-4" />
                      <span>Beat Battle</span>
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      <span>Open Verse</span>
                    </>
                  )}
                </div>
              </div>

              <Button className="w-full">Enter Contest</Button>
            </motion.div>
          ))}
        </div>
      )}

      <ContestCreateDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onContestCreated={handleContestCreated}
      />
    </div>
  );
};

export default Contests;
