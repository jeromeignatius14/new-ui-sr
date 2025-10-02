import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

// For debugging
const debug = (message: string, data?: any) => {
    console.log(`[NextAuth] ${message}`, data ? data : '');
};

//auth options
export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                accessToken: { label: 'Access Token', type: 'text' },
                refreshToken: { label: 'Refresh Token', type: 'text' },
                user: { label: 'User', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials) return null;

                try {
                    const user = JSON.parse(credentials.user);

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        department: user.department,
                        depot: user.depot,
                        phone: user.phone,
                        accessToken: credentials.accessToken,
                        refreshToken: credentials.refreshToken,
                        location: user.location,
                    };
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: any }) {
            // debug('JWT Callback', { tokenBefore: { ...token }, user });
            if (user) {
                // debug('Setting user data in token');
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.role = user.role;
                token.department = user.department;
                token.phone = user.phone;
                token.depot = user.depot;
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.location = user.location;
            }

            // debug('JWT Callback result', { tokenAfter: { ...token } });
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            // debug('Session Callback', { sessionBefore: { ...session }, token });

            if (token) {
                if (!session.user) {
                    session.user = {
                        name: token.name as string,
                        email: token.email as string,
                        id: token.id as string,
                        role: token.role as string,
                        depot: token.depot as string,
                        department: token.department as string,
                        phone: token.phone as string,
                        accessToken: token.accessToken as string,
                        refreshToken: token.refreshToken as string,
                        location: token.location as string,
                    };
                }

                session.user.id = token.id as string;
                session.user.accessToken = token.accessToken as string;
                session.user.refreshToken = token.refreshToken as string;
                session.user.role = token.role as string;
                session.user.department = token.department as string;
                session.user.phone = token.phone as string;
                session.user.location = token.location as string;
                session.user.depot = token.depot as string;
            }

            // debug('Session Callback result', { sessionAfter: { ...session } });
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
    session: {
        strategy: 'jwt' as const,
        // Setting to the maximum allowed value (100 years) to effectively make it non-expiring
        maxAge: 100 * 365 * 24 * 60 * 60, // 100 years
    },
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here-for-development',
}; 