private getListOfUsersToBeDisplayed = (): OtherUser[] => {
    const {activeType, isSearchInputOpen} = this.state;

    if (activeType === BoardType.All && isSearchInputOpen && this.isSearchActive()) {
      return this.organizeSearchedUsersBasedOnRanksAndVisibility();
    }

    if (activeType !== BoardType.All && isSearchInputOpen) {
      return this.filterAndRankShownUsersBasedOnSearch();
    }

    return get(this.props, activeType);
  };

  private organizeSearchedUsersBasedOnRanksAndVisibility = (): OtherUser[] => {
    const {searchResult} = this.props;
    const visibleUsers = searchResult.filter((user: OtherUser) => user.progressVisible);
    const invisibleUsers = searchResult.filter((user: OtherUser) => !user.progressVisible);
    visibleUsers.sort((u1: OtherUser, u2: OtherUser) => u1.rank - u2.rank);

    return visibleUsers.concat(invisibleUsers);
  };

  private filterAndRankShownUsersBasedOnSearch = (): OtherUser[] => {
    const {activeType} = this.state;
    const users = get(this.props, activeType);

    return users
      .filter((user: OtherUser) => this.userMatchesSearch(user))
      .sort((u1: OtherUser, u2: OtherUser) => u1.rank - u2.rank);
  };

  private handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {activeType} = this.state;
    const currentValue: string = event.target.value.replace(/^\s+$/, "");

    this.setState({activeSearchQuery: currentValue}, () => {
      if (activeType === BoardType.All) {
        this.searchActivityBoardDebounced(currentValue);
      }
    });
  };

  private searchActivityBoard = (query: string): void => {
    const {search, searchQuery} = this.props;
    query = query.trim();

    if (query.length < 3) {
      query = "";
    }

    if (query === searchQuery) {
      return;
    }

    search(query);
  };

  private navClicked = (type: BoardType) => {
    return (event: React.MouseEvent<HTMLAnchorElement>): void => {
      event.preventDefault();
      const {clearSearchQuery} = this.props;
      this.setState({activeType: type, activeSearchQuery: ""}, clearSearchQuery);
    };
  };

  private isSearchActive = (): boolean => this.props.searchQuery !== "";

  private getRankingBasedOnActiveType = (): number => {
    const activeTabType = this.state.activeType;
    const {myPeersRank, myAllRank, myTeamRank} = this.props;

    switch (activeTabType) {
      case BoardType.Peers:
        return myPeersRank;
      case BoardType.All:
        return myAllRank;
      case BoardType.Team:
        return myTeamRank;
    }

    return myAllRank;
  };

  private userMatchesSearch = (user: OtherUser): boolean => {
    const {activeSearchQuery} = this.state;
    const searchString = escaperegexp(activeSearchQuery.trim());
    const searchRegex = new RegExp(searchString, "i");

    return (
      searchRegex.test(`${user.displayName} ${user.lastName}`) ||
      searchRegex.test(`${user.firstName} ${user.lastName}`) ||
      searchRegex.test(user.lastName)
    );
  };

  private showModal = (user: OtherUser) => (): void => {
    this.setState({userCardOpen: true, userCardContent: user});
  };

  private hideModal = (): void => {
    this.setState({userCardOpen: false, userCardContent: initOtherUser});
  };

  private expandSearchInput = (): void => {
    this.setState({isSearchInputOpen: true});
  };

  private collapseSearchInput = (): void => {
    const {clearSearchQuery} = this.props;
    this.setState({activeSearchQuery: "", isSearchInputOpen: false}, clearSearchQuery);
  };

  private isInvitationSent = (userId: string): boolean => {
    const {pendingInvitees} = this.props;
    return pendingInvitees.indexOf(userId) > -1;
  };
}

export {ActivityBoard};
