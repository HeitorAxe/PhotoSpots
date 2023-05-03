//This is the function responsible for wrapping async functions in try/catch
//Function that returns a function
module.exports =  fn =>{
    return function(req, res, next){
        fn(req, res, next).catch(e=>{next(e)});
    }
};