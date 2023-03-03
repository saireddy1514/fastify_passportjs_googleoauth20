// Intializing the Libraries
const fastify = require('fastify')({
    logger:true
});
const fastifyPassport = require('fastify-passport');
const fastifySecureSession = require('fastify-secure-session');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const GoogleStratergy = require('passport-google-oauth20').Strategy;

dotenv.config();


// Register the Libraries in Fastifu
fastify.register(fastifySecureSession,{
    key:fs.readFileSync(path.join(__dirname, 'not-so-secret-key')),
    cookie:{
        path:'/'
    }
})
fastify.register(fastifyPassport.initialize());
fastify.register(fastifyPassport.secureSession());


//Google Startergy Using
fastifyPassport.use('google', new GoogleStratergy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_CLIENT_CALLBACK_URL
},(accessToken,refreshToken,profile,cb)=>{
    cb(undefined,profile);
}))


fastify.get('/auth/google/callback',
{preValidation:fastifyPassport.authenticate('google',{scope:['profile']})},
async (req,res)=>{
    res.redirect('/');
})

fastifyPassport.registerUserDeserializer(async(user,req)=>{
    return user;
})

fastifyPassport.registerUserSerializer(async(user,req)=>{
    return user;
})

// Test Route
fastify.get('/',async (request,reply)=>{
    console.log(request.user);
    reply.send({msg:"Hello Folk"})
})

fastify.get('/login',fastifyPassport.authenticate('google',{scope:['profile']}))
fastify.get('/logout', async (request,reply)=>{
    request.logout();
    reply.send({success:true})
})


// Server Running
const start= async()=>{
    try{
        await fastify.listen({port:process.env.PORT},(err,address)=>{
            if(err){
                fastify.log.error(err);
            }
            else{
                fastify.log.info(`Server started on ${address}`);
            }
        })
    }
    catch(err){
        throw err;
    }
}


start()
