module.exports = {
    apps: [
        {
            name: "webapp",
            script: "npm",
            args: "start",
            error_file: 'logs/webapp-err.log',
            combine_logs: true,
            out_file: 'logs/webapp-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm Z'
        },
    ],
};