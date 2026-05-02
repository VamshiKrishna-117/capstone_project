import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Channel from "./models/Channel.js";
import Video from "./models/Video.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Video.deleteMany();
    await Channel.deleteMany();
    await User.deleteMany();

    // ── Helper ─────────────────────────────────────────────────────────
    const createChannel = async (data) => {
      const channel = await Channel.create(data);
      return channel;
    };

    const createVideos = async (channel, videoDefs) => {
      const videos = await Video.insertMany(
        videoDefs.map((v) => ({ ...v, channelId: channel._id }))
      );
      channel.videos = videos.map((v) => v._id);
      await channel.save();
      return videos;
    };

    // ── Netflix India ──────────────────────────────────────────────────
    const netflixChannel = await createChannel({
      channelName: "Netflix India",
      avatar: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777732586/NETFLIX_INDIA/channels4_profile_gwupg8.jpg",
      description: "About Netflix: Netflix is one of the world's leading entertainment services offering TV series, films, games and live programming across a wide variety of genres and languages.",
      channelBanner: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777732586/NETFLIX_INDIA/channels4_banner_hx2l41.jpg",
      subscribers: 28800000,
    });

    await createVideos(netflixChannel, [
      {
        title: "CHILL Slowly Slowly 😎 | Sunil Grover Ft. Ishan Kishan, Abhishek Sharma & Travis Head | SRH x Netflix",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777732586/NETFLIX_INDIA/THUMB_1_hc90nw.jpg",
        videoUrl: "https://www.youtube.com/embed/EfGYpqXkiDg",
        description: "Stadium se living room, it's pure Dhoom Dhadaka 🕺🪩🧡 Netflix, Official Entertainment Partner Of The SunRisers Hyderabad.",
        category: "Entertainment",
        views: 45595841,
        uploadDate: new Date("2026-04-22"),
      },
      {
        title: "Rohit Sharma & Shikhar Dhawan = Do Bhai, both Serial Chillers 🤭📺🍿 | Mumbai Indians x Netflix",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777732586/NETFLIX_INDIA/thumb_2_bhit5x.jpg",
        videoUrl: "https://www.youtube.com/embed/m9vvS5S9LyI",
        description: "Do bhai dono serial chillers 📺🍿 Netflix, Official Entertainment Partner Of The Mumbai Indians.",
        category: "Entertainment",
        views: 17692825,
        uploadDate: new Date("2026-04-18"),
      },
      {
        title: "Bella Ciao Full Song | La Casa De Papel | Money Heist | Netflix India",
        thumbnailUrl: "https://picsum.photos/seed/netflix3/640/360",
        videoUrl: "https://www.youtube.com/embed/46cXFUzR9XM",
        description: "We never want to say Bella Ciao to this song. Catch La Casa De Papel (Money Heist), streaming on Netflix.",
        category: "Entertainment",
        views: 101900269,
        uploadDate: new Date("2020-03-24"),
      },
    ]);

    // ── Internshala ────────────────────────────────────────────────────
    const internshalaChannel = await createChannel({
      channelName: "Internshala",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Internshala&backgroundColor=0A66C2",
      description: "Welcome to official YouTube channel of Internshala. Be it internships or fresher jobs, new skills or technologies, courses, workshops and college events — we cover everything that shapes your career.",
      channelBanner: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777732876/intershala/channels4_banner_uei3r0.png",
      subscribers: 176000,
    });

    await createVideos(internshalaChannel, [
      {
        title: "5 Resume Formats ATS Always Rejects — Free Template for Freshers (2026)",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777732876/intershala/thumb_1_ctmrey.jpg",
        videoUrl: "https://www.youtube.com/embed/18qMKn_RtMw",
        description: "Sending out resumes but getting no callbacks? Learn how to make an ATS-friendly resume as a fresher.",
        category: "Education",
        views: 2536,
        uploadDate: new Date("2026-04-21"),
      },
      {
        title: "Top 5 AI JOBS in 2026: Tech & Non-Tech (₹12 LPA) | Apply on Internshala",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777732876/intershala/thumb_2_htfcpn.jpg",
        videoUrl: "https://www.youtube.com/embed/fYSFBoKHybw",
        description: "These 5 AI jobs for freshers can help you get hired in 2026 (Tech & Non-Tech).",
        category: "Education",
        views: 1615,
        uploadDate: new Date("2026-04-07"),
      },
      {
        title: "How to Get a PAID Internship FAST on Internshala | Step-by-Step For 2026",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777732876/intershala/thumb_3_igh9cc.jpg",
        videoUrl: "https://www.youtube.com/embed/E49guQqe23o",
        description: "Step-by-step guide to land a paid internship quickly using Internshala.",
        category: "Education",
        views: 19933,
        uploadDate: new Date("2025-07-24"),
      },
    ]);

    // ── Prime Video India ──────────────────────────────────────────────
    const primeChannel = await createChannel({
      channelName: "Prime Video India",
      avatar: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733136/prime/channels4_profile_cffjpp.jpg",
      description: "Prime Video is a premium streaming service that offers Prime members award-winning Amazon Original series, thousands of movies and TV shows — all in one place.",
      channelBanner: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733136/prime/channels4_banner_y2j1gr.jpg",
      subscribers: 38900000,
    });

    await createVideos(primeChannel, [
      {
        title: "Soldier Boy saves Homelander 🔥 | Jensen Ackles, Antony Starr | The Boys Final Season #trending",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733136/prime/thumb_1_xzrvdp.jpg",
        videoUrl: "https://www.youtube.com/embed/HPMbZ_yZmlE",
        description: "Watch the web series The Boys, new episode every Wednesday on Prime Video India.",
        category: "Entertainment",
        views: 5577,
        uploadDate: new Date("2026-05-02"),
      },
      {
        title: "Jimmy Se PANGA Matlab DANGA 🔥 | Ambrish Verma | Sapne vs Everyone Season 2",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733136/prime/thumb_2_a9ibua.jpg",
        videoUrl: "https://www.youtube.com/embed/j_DjlZJLNFE",
        description: "Watch Sapne Vs Everyone starring Ambrish Verma and Paramvir Singh Cheema on Prime Video India.",
        category: "Entertainment",
        views: 29123,
        uploadDate: new Date("2026-05-02"),
      },
      {
        title: "Obsession Is In Session | Prime Video India",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733137/prime/thunb_3_juijaq.jpg",
        videoUrl: "https://www.youtube.com/embed/yFuBS77ODLk",
        description: "Obsession is in session. Only on Prime Video India.",
        category: "Entertainment",
        views: 12056,
        uploadDate: new Date("2026-04-30"),
      },
    ]);

    // ── Nancy Solanki ──────────────────────────────────────────────────
    const nancyChannel = await createChannel({
      channelName: "Nancy Solanki",
      avatar: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733006/nancy/channels4_profile_vwilge.jpg",
      description: "For collaborations, partnerships, or brand inquiries: 📩 thecatalystgirlcollab@gmail.com — Let's connect on LinkedIn, Instagram, and Twitter to grow together.",
      channelBanner: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733006/nancy/channels4_banner_l4jumx.jpg",
      subscribers: 62900,
    });

    await createVideos(nancyChannel, [
      {
        title: "Stop Doing DSA !! Do this to get Internships",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733006/nancy/thumb_1_nnbme4.jpg",
        videoUrl: "https://www.youtube.com/embed/HB4Ej9WOZ4I",
        description: "What actually matters to land an internship without wasting months blindly on DSA.",
        category: "Education",
        views: 2975,
        uploadDate: new Date("2026-05-01"),
      },
      {
        title: "How I learnt System Design to Crack Remote Job | LLD",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733006/nancy/thumb_2_uhlrne.jpg",
        videoUrl: "https://www.youtube.com/embed/f1W7pRPeEcw",
        description: "Roadmap to crack low-level design interviews and apply concepts effectively.",
        category: "Education",
        views: 24063,
        uploadDate: new Date("2026-04-20"),
      },
      {
        title: "How I learnt System Design to Crack Remote Job in 2026 | HLD",
        thumbnailUrl: "https://res.cloudinary.com/dnetveiga/image/upload/q_auto/f_auto/v1777733006/nancy/thumb_3_azikvp.jpg",
        videoUrl: "https://www.youtube.com/embed/NxFZLnFY4S4",
        description: "Complete roadmap to learn system design from basics to advanced for interviews.",
        category: "Education",
        views: 5848,
        uploadDate: new Date("2026-04-14"),
      },
    ]);
    console.log("Data Imported!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();
