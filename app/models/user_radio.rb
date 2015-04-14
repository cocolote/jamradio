class UserRadio < ActiveRecord::Base
  belongs_to :user
  belongs_to :radio

  validates :user,
  uniqueness: {scope: :radio},
    presence: true

  validates :radio,
    presence: true
end
