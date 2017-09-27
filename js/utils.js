module.exports = () => {

// const detailsUrl = "http://localhost:3095/areas/";
//     const detailsUrl = "https://tiles.fldev.di.unito.it/areas/";
const detailsUrl = "https://tiles.firstlife.org/areas/";


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
        console.log('getFeature', id);
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


    function getIcon(entry) {
        let icon = 'place';

        if (entry.properties.hasType) {

            let type = entry.properties.hasType.toLowerCase();
            // console.debug('type?',type);
            switch (type) {
                case 'school':
                    icon = 'school';
                    break;
                case 'initiative':
                    icon = 'assessment';
                    break;
                case 'event':
                    icon = 'event';
                    break;
                case 'report':
                    icon = 'build';
                    break;
                default:
                    icon = 'room';
            }
        }
        if (entry.activity_type) {
            // parse activity type
            let activity = entry.activity_type.toLowerCase();
            // console.debug('activity: ', activity);
            switch (activity) {
                case 'object_created' : break;
                case 'object_removed' : icon = 'delete'; break;
                case 'contribution_added' : icon = 'playlist add'; break;
                case 'contribution_updated': icon = 'playlist add check'; break;
                case 'contribution_removed' : icon = 'exposure neg 1'; break;
                case 'issue_voted_on' : icon = 'exposure plus 1'; break;
                case 'interest_added' : icon = 'exposure plus 1'; break;
                case 'interest_removed' : icon = 'exposure neg 1'; break;
                case 'support_added' : icon = 'exposure plus 1'; break;
                case 'support_removed' : icon = 'exposure neg 1'; break;
                case 'suggestion_rated' : icon = 'exposure'; break;
                default: break;
            }
        }


        return '<i class="material-icons mdl-list__item-icon">'+ icon + '</i>';
    }



    return {
        hideStyle: hideStyle,
        getFeature: getFeature,
        getIcon: getIcon
    }
};