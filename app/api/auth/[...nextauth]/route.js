import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'
import GitHubProvider from "next-auth/providers/github";

import connectDb from '@/db/connectDb';
import User from '@/models/User';

 

export const authoptions =  NextAuth({
    providers: [
      // OAuth authentication providers...
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET
      }),
      LinkedInProvider({
        clientId: process.env.LINKEDIN_ID,
        clientSecret: process.env.LINKEDIN_SECRET
      }),
    ],
    callbacks: {
      async signIn({ user, account, profile, email, credentials }) {
         if(["github", "google", "linkedin"].includes(account.provider)) { 
          await connectDb()
          // Check if the user already exists in the database
          const currentUser =  await User.findOne({email: user.email}) 
          if(!currentUser){
            // Create a new user
             const newUser = await User.create({
              email: user.email, 
              username: user.email.split("@")[0], 
            })   
          } 
          return true
         }
         return false
      },
      
      async session({ session, user, token }) {
        const dbUser = await User.findOne({email: session.user.email})
        if (dbUser) {
          session.user.name = dbUser.username
        }
        return session
      },
    } 
  })

  export { authoptions as GET, authoptions as POST}