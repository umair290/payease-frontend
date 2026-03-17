useEffect(() => {
  const onboarded = localStorage.getItem('payease_onboarded');
  if (!onboarded) {
    navigate('/onboarding');
  }
}, []);
