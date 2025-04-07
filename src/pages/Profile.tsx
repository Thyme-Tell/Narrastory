
  const getPlanLabel = (planType: PlanType): string => {
    if (!subscriptionStatus.isPremium) {
      return 'Free Plan';
    }
    
    switch (planType) {
      case 'lifetime':
        return 'Narra+';
      case 'annual':
      case 'plus':
        return 'Narra+';
      case 'monthly':
        return 'Narra+';
      default:
        return 'Narra+';
    }
  };
