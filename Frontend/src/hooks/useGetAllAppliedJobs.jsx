import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import axios from "@/utils/axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAppliedJobs = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      console.log("=== FETCHING APPLIED JOBS ===");
      try {
        console.log("Making API call to:", `${APPLICATION_API_ENDPOINT}/get`);
        const res = await axios.get(`${APPLICATION_API_ENDPOINT}/get`, {
          withCredentials: true,
        });
        console.log("=== APPLIED JOBS API RESPONSE ===");
        console.log("Status:", res.status);
        console.log("Success:", res.data.success);
        console.log("Applications count:", res.data.application?.length || 0);
        console.log("Applications data:", res.data.application);
        console.log("==================================");
        
        if (res.data.success) {
          dispatch(setAllAppliedJobs(res.data.application));
          console.log("Applied jobs dispatched to Redux");
        } else {
          console.log("API call unsuccessful");
        }
      } catch (error) {
        console.log("=== APPLIED JOBS API ERROR ===");
        console.log("Error:", error);
        console.log("Status:", error.response?.status);
        console.log("Message:", error.response?.data?.message);
        console.log("===============================");
      }
    };
    fetchAppliedJobs();
  }, [dispatch]);
  return null;
};

export default useGetAppliedJobs;
