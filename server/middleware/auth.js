const { User } = require("../models/User");


let auth = (req, res, next) => {

    // 인증 처리를 하는 곳

    // 클라이언트 쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth;

    // 토큰을 복호화 한 후 유저를 찾는다.
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: true })

        req.token = token; // 사용할 수 있게하기 위해 req 정보에 token과 user를 넣어줌
        req.user = user;
        next(); // next를 하는 이유는 middleware에서 계속 진행될 수 있도록 하기 위함(없으면 갇혀버림)
    })
}

module.exports = { auth };