let copymode = false;
const lnkElement = $('#link');

let copyLink = function() {
    lnkElement.select();
    $('#copy-btn').html(`
        <i class="glyphicon glyphicon-copy"></i>copied
    `);
    document.execCommand('copy');
    $("#success-msg").fadeTo(1000, 500).slideUp(500, function(){
        $("#success-msg").slideUp(500);
    });
}

$('#main-form').submit(function(e) {
    e.preventDefault();
    const link = lnkElement.val();
    if (!copymode) {
        $.ajax({
            type: 'POST',
            url: '/graphql/',
            contentType: 'application/json',
            data: JSON.stringify({
                query: `mutation {
                    createUrl(fullUrl: "${link}") {
                        url {
                            urlHash
                        }
                    }
                }`
            }),
            success: function (res) {
                if (res['errors']) {
                    $('#error-msg').removeClass('hidden');
                    console.log(res.errors);
                    return;
                }
                const hash = res.data['createUrl'].url['urlHash'];

                $('#shorten-btn').addClass('hidden');
                $('#copy-btn').removeClass('hidden');

                $('#link').val(`${document.location.href}${hash}`);

                const statshref = $('#stats-btn');

                statshref.show();
                statshref.attr('href', statshref.attr('href') + hash);

                lnkElement.prop('readonly', true);

                copymode = true;

                let q = new QRCode("qrcode", {
                    display: ''
                });
                q.makeCode(`${document.location.href}${hash}`);
                $('#qrcode').show();

            }
        });
    } else {
        copyLink();
    }
});
