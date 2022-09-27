$(() => {

  const $logInForm = $(`
  <form id="login-form" class="login-form">
      <h2>Login:</h2>
      <div class="login-form__field-wrapper">
        <input type="email" name="email" placeholder="Email">
      </div>

      <div class="login-form__field-wrapper">
          <input type="password" name="password" placeholder="Password">
        </div>

      <div class="login-form__field-wrapper">
          <button class="button">Login</button>&nbsp;&nbsp;
          <a id="login-form__cancel" class="button" href="#">Cancel</a>
      </div>
    </form>
  `);

  window.$logInForm = $logInForm;

  $logInForm.on('submit', function(event) {
    event.preventDefault();

    const data = $(this).serialize();
    logIn(data)
      .then(json => {
        console.log(json);
        if (!json.user) {
          views_manager.show('error', 'Failed to login');
          return;
        }
        console.log(json.user);
        header.update(json.user);
        views_manager.show('listings');
      });
  });

  $('body').on('click', '#login-form__cancel', function() {
    views_manager.show('listings');
    return false;
  });
      
});