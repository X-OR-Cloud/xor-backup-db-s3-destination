const get_date_time = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hour = date.getHours().toString();
    const minute = date.getMinutes().toString();
    const second = date.getSeconds().toString();

    const formatted_date = `${day}${month}${year}`;
    const formatted_time = `${hour}${minute}${second}`;

    return {
        date: formatted_date,
        time: formatted_time
    };
}

export default get_date_time;