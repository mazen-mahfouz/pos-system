export default function handleReqErrors(err) {
    if (err.response) {
        if (err.response.status == 422) {
            for (let message in err.response._data.errors) {
                push.error(err.response._data.errors[message][0]);
            }
        } else if (err.response.status == 400 || err.response.status == 401) {
            push.error(err.response._data.error);
        } else if (err.response.status == 500) {
            push.error("Something went wrong .. please try again later");
        }
    }
}
