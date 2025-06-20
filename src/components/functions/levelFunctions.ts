import { useUser } from "../../contexts/UserContext";

export const useLevels = () => {
  const completeLevel = async (levelId: number, userId: any) => {
    console.log("Completing level:", levelId, "user:", userId);
    if (!userId) {
      console.log("User is not authenticated");
      return;
    }

    try {
      const response = await fetch("/api/levels/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ levelId, userId: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error completing level:", error);
      throw error;
    }
  };

  return { completeLevel };
};
