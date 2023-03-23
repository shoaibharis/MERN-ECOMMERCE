class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr
    }
    
    search(){
        const keyword=this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword,
                $options:"i",
            }
        }:{}
    this.query=this.query.find({...keyword});
    return this
    }
    
    filter(){
        const queryCopy={...this.queryStr}
      //Removing some fields for category
      const removeFields=["keyword","page","limit"]
      removeFields.forEach(key=>delete queryCopy[key])

      //Filter for Price and Rating
      let queryStr=JSON.stringify(queryCopy); //converting object to string
      queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=> `$${key}`); //converting to mongoDB expression
    
      this.query=this.query.find(JSON.parse(queryStr)); //converting to object 
      
      return this
    }

    pagination(resultPerPage){
        const CurrentPage=Number(this.queryStr.page) || 1; //converting string to number
        
        const skip= resultPerPage * (CurrentPage-1) //products to skip on each page
        this.query=this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}
module.exports=ApiFeatures;