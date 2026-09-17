import http from 'k6/http'

export const options = {
    vus:100,
    duration:'30s'
}
// const URL = "https://clinic-management-system-production-vs2pu9.laravel.cloud/"
const URL = "https://menupro.cloud/test.php"
export default function (){
    http.get(URL);
}