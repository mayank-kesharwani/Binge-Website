# Binge 🎬

Binge is a full-stack video streaming platform inspired by modern video-sharing applications. It is built with **Next.js, TypeScript, Tailwind CSS, Node.js, Express, MongoDB, and Socket.IO**.

The platform provides video discovery, creator channels, authentication, social interactions, memberships, subscriptions, downloads, notifications, and real-time Watch Party functionality.

## ✨ Features

### 🎥 Video Platform

- Browse and discover videos
- Search videos
- Category-based video filtering
- Video playback with custom controls
- Video upload and management
- Public/private video visibility
- Video thumbnails with Cloudinary media storage
- View tracking
- Watch history
- Watch Later
- Favorites / liked videos

### 👤 Authentication & Accounts

- User registration and login
- Email OTP verification
- OTP resend and expiration handling
- Protected and public routes
- User profile management
- Avatar upload
- Account settings
- Privacy and preference settings
- Session authentication using JWT

### 💬 Social Features

- Like and unlike videos
- Comments and replies
- Comment reactions
- Comment translation
- Comment reporting
- Channel subscriptions
- Subscriber notifications

### 📺 Creator & Channel Features

- Create a channel
- Edit channel information
- Channel banner and avatar
- Creator dashboard
- Video management
- Video editing
- Channel statistics
- Custom creator profile

### 💎 Membership

Binge includes a membership system with multiple plans:

- Free
- Bronze
- Silver
- Gold

Membership features include:

- Premium video access
- Extended watch limits
- Download limits
- Ad-free experience for eligible plans
- Razorpay payment integration
- Membership expiry management

### 🤝 Watch Party

Real-time Watch Party functionality powered by **Socket.IO** and **WebRTC**.

Users can:

- Create a Watch Party
- Join using a party code
- Watch videos together
- Communicate through real-time chat
- Use video calling functionality

### 🔔 Notifications

Supports notifications for:

- New videos
- New subscribers
- Likes
- Comments
- Replies
- Account updates
- System updates

### 🌐 Internationalization

Binge supports:

- English
- Hindi

The interface uses **next-intl** for localization.

### 🎨 UI & Theme

- Responsive design
- Light and dark themes
- Tailwind CSS
- shadcn/ui components
- Lucide icons
- Reusable React components
- Mobile-friendly layouts

---

## 🛠️ Tech Stack

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **next-intl**
- **Zustand**
- **Axios**
- **Lucide React**
- **Socket.IO Client**

### Backend

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT**
- **Socket.IO**
- **WebRTC**
- **Brevo**
- **Cloudinary**
- **Razorpay**

---

## 📁 Project Structure

```text
BINGE/
│
├── binge/                         # Next.js frontend
│   ├── app/                       # App Router pages
│   │   ├── (auth)/                # Authentication pages
│   │   └── (main)/                # Main application pages
│   │
│   ├── components/                # Reusable UI components
│   │   ├── auth/
│   │   ├── channel/
│   │   ├── creator/
│   │   ├── favorites/
│   │   ├── history/
│   │   ├── layout/
│   │   ├── notification/
│   │   ├── settings/
│   │   ├── subscriptions/
│   │   ├── upload/
│   │   ├── video/
│   │   ├── watch/
│   │   └── watch-party/
│   │
│   ├── context/                   # React contexts
│   ├── constants/                 # Frontend constants
│   ├── lib/                       # Utility functions
│   ├── messages/                  # Localization files
│   ├── services/                  # API service layer
│   ├── store/                     # Zustand stores
│   └── types/                     # TypeScript types
│
└── server/                        # Express backend
    └── src/
        ├── config/                # Service configurations
        ├── constants/             # Backend constants
        ├── controllers/           # Request controllers
        ├── middleware/            # Express middleware
        ├── models/                # Mongoose models
        ├── routes/                # API routes
        ├── socket/                # Socket.IO functionality
        └── utils/                 # Utility functions

📌 Project Status

Binge is an actively developed full-stack project with its core video streaming, authentication, social interaction, creator, membership, notification, and real-time Watch Party features implemented.

⸻

📄 License

This project is licensed under the ISC License.

⸻

👨‍💻 Author

Mayank Kesharwani

Built with ❤️ while exploring full-stack development, real-time applications, and modern web technologies.