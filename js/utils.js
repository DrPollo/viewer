module.exports = () => {

// const detailsUrl = "http://localhost:3095/areas/";
    const detailsUrl = "https://tiles.fldev.di.unito.it/areas/";
// const detailsUrl = "https://tiles.firstlife.org/areas/";


// cambia stile
    function hideStyle(id) {
        return (feature) => {
            // console.debug('new style for', (feature.area_id === id ) );
            if(feature.area_id && feature.area_id === id){
                // console.debug('dentro',feature.id);
                return {
                    up:true
                };
            } else {
                return {
                    weight: 0,
                    fillColor: 'gray',
                    radius:1,
                    up:false
                }
            }
        }
    }
// get feature by id
    function getFeature(id) {
        // console.log('getFeature', id);
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = detailsUrl.concat(id);
            // console.log('asking to ', url);
            xhr.open("GET", url);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        });
    }

    return {
        hideStyle: hideStyle,
        getFeature: getFeature
    }
};