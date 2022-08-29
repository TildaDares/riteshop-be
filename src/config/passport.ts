import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "@/resources/user/user.model";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/api/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ googleId: profile.id });

      // If user doesn't exist creates a new user. (similar to sign up)
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          // we are using optional chaining because profile.emails may be undefined.
          email: profile.emails?.[0].value,
          role: "customer",
        });
        if (user) {
          done(null, user);
        }
      } else {
        done(null, user);
      }
    }
  )
);

export default passport;