class Enum {

  static student= "Student";
  static company= "Company";
  static admin= "Admin";

  static choduyet= "chờ duyệt";
  static daDuyet= "đã duyệt";
  static tuChoi= "từ chối";

  constructor(baseURL) {
    this.baseURL = baseURL || "http://localhost:5154"; 
  }

  getUrl(endpoint) {
    return `${this.baseURL}/${endpoint}`;
  }
}

export default Enum;