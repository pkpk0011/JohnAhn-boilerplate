const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10 // salt가 몇글자인지를 나타냄
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // space 간격을 없애주는 역할
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: { // 관리자 설정 1이면 관리자 0이면 일반 유저
        type: Number,
        default: 0
    },
    image: String,
    token: { // 유효성 관리
        type: String
    },
    tokenExp: { // 유효성 기간
        type: Number
    }
})

userSchema.pre('save', function( next ){  // mongoose에서 가져온 method 'save' 하기 전에 실행되는 함수 이후에 save가 실행됨
    var user = this;

    if(user.isModified('password')) { // 비밀번호가 바뀔 때만 암호화 실행
        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if(err) return next(err); // err 발생시 다음으로 넘어감
            bcrypt.hash(user.password, salt, function (err, hash) {
                if(err) return next(err);
                user.password = hash;
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {

    // plainPassword(입력받는 password) pk0011         암호화된 비밀번호 $2b$10$AK68oEOkKvK1kRAXDkBgYeiHNnx72sacJbRjAf1TX6LsOeMMCyDFO 두개를 비교해야하기 때문에 palinPassword 또한 암호하해야함
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;

    // jsonwebtoken을 이용해서 token을 생성하기
    
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    // user._id + 'secretToken' = token
    // ->
    // 'secretToken'을 넣으면 user._id 가 나옴

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })

}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // user._id + '' = token
    // 토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 token이 일치하는지 확인

        user.findOne({ "_id": decoded, "token": token }, function (err, user) {

            if(err) return cb(err);
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }